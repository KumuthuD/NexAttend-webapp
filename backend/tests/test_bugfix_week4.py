"""
Week 4 Deployment Bug Fix Verification
---------------------------------------
Verifies all bugs fixed on Day 21.

Bugs fixed:
  1. /recognize used strict registration detector (95% confidence)
     -> switched to classroom_detector (80%) to stop filtering real faces
  2. session_id from form is a plain string but MongoDB _id is ObjectId
     -> added ObjectId cast before doing find_one / update_one
  3. CORS wildcard (*) + allow_credentials=True is invalid CORS spec
     -> switched to explicit origin list from settings
  4. SingleFaceRecognitionService() was instantiated at module import time
     -> replaced with lazy getter get_single_face_service()

Viraj Jayasiri
Week 05 Day 21
Branch: bugfix/ai/week4-bugs
"""

import sys
import os

# add backend to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

import numpy as np


# ---------------------------------------------------------------
# Bug 1: /recognize was using strict detector during attendance
# ---------------------------------------------------------------
def test_recognize_uses_classroom_detector():
    """
    /recognize should use classroom_detector (80% confidence, 30px min face)
    not the strict registration detector (95% confidence, 50px min face).
    The strict detector was filtering out real student faces in attendance mode.
    """
    # read the faces.py source and verify the fix is in place
    faces_path = os.path.join(backend_dir, "app", "api", "routes", "faces.py")
    with open(faces_path, "r") as f:
        source = f.read()

    # the /recognize block should now call classroom_detector, not detector
    # check that the fix comment is present
    assert "classroom_detector.detect_faces(image)" in source, \
        "Bug 1 not fixed: /recognize still uses strict detector"

    # also confirm the classroom_detector is defined with relaxed settings
    assert "classroom_detector = FaceDetector(min_face_size=30, min_confidence=0.80)" in source, \
        "classroom_detector settings changed unexpectedly"

    print("PASS - Bug 1 fixed: /recognize now uses classroom_detector")


# ---------------------------------------------------------------
# Bug 2: session_id string vs ObjectId mismatch
# ---------------------------------------------------------------
def test_session_objectid_cast():
    """
    session_id comes from an HTML form as a plain string.
    MongoDB _id for attendance_sessions is stored as ObjectId.
    Comparing string to ObjectId always returns None (no match found),
    so attendance was never actually marked.
    Fix: cast session_id to ObjectId before the lookup.
    """
    from bson import ObjectId

    # simulate what the fix does
    fake_session_id = "507f1f77bcf86cd799439011"

    try:
        oid = ObjectId(fake_session_id)
        assert str(oid) == fake_session_id
        print("PASS - Bug 2 fixed: ObjectId cast works correctly")
    except Exception as e:
        print(f"FAIL - Bug 2: ObjectId cast failed: {e}")
        raise

    # verify the fix is in the source
    faces_path = os.path.join(backend_dir, "app", "api", "routes", "faces.py")
    with open(faces_path, "r") as f:
        source = f.read()

    assert "session_oid = ObjectId(session_id)" in source, \
        "Bug 2 not fixed: ObjectId cast not in faces.py"

    print("PASS - Bug 2 verified in source")


# ---------------------------------------------------------------
# Bug 3: CORS wildcard + credentials
# ---------------------------------------------------------------
def test_cors_not_wildcard():
    """
    CORS spec forbids allow_origins=["*"] together with allow_credentials=True.
    Browsers (Chrome, Firefox) refuse requests with Authorization headers
    when the server responds with Access-Control-Allow-Origin: *.
    This was blocking all authenticated frontend calls on staging.
    Fix: use explicit origin list from settings.BACKEND_CORS_ORIGINS.
    """
    main_path = os.path.join(backend_dir, "app", "main.py")
    with open(main_path, "r") as f:
        source = f.read()

    # the bad pattern should not be present
    assert 'allow_origins=["*"]' not in source, \
        'Bug 3 not fixed: wildcard origin still in main.py'

    # the fix should be using settings.BACKEND_CORS_ORIGINS
    assert "allow_origins=settings.BACKEND_CORS_ORIGINS" in source, \
        "Bug 3 not fixed: settings.BACKEND_CORS_ORIGINS not used in main.py"

    print("PASS - Bug 3 fixed: CORS uses explicit origin list")


# ---------------------------------------------------------------
# Bug 4: global model load at import time
# ---------------------------------------------------------------
def test_lazy_service_init():
    """
    SingleFaceRecognitionService() was instantiated as a module-level global.
    This triggers MTCNN + DeepFace model loading at import time,
    before the app was ready. On Render's free tier this caused
    startup timeouts and out-of-memory kills.
    Fix: lazy getter get_single_face_service() only loads on first call.
    """
    sfrs_path = os.path.join(
        backend_dir, "app", "services", "ai", "single_face_recognition_service.py"
    )
    with open(sfrs_path, "r") as f:
        source = f.read()

    # the old public name at module scope should not be an assignment pointing to the class
    # (it was: single_face_service = SingleFaceRecognitionService()  <-- public, module-level)
    # the private _single_face_service is fine (it's inside the lazy getter)
    import re
    module_level_eager = re.search(
        r'^single_face_service\s*=\s*SingleFaceRecognitionService\(',
        source,
        re.MULTILINE
    )
    assert module_level_eager is None, \
        "Bug 4 not fixed: public module-level SingleFaceRecognitionService() still present"

    # the lazy getter should be there
    assert "def get_single_face_service()" in source, \
        "Bug 4 not fixed: get_single_face_service() not defined"

    print("PASS - Bug 4 fixed: lazy init getter replaces eager global")


# ---------------------------------------------------------------
# Run all checks
# ---------------------------------------------------------------
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("NEXATTEND - WEEK 4 BUG FIX VERIFICATION")
    print("Viraj Jayasiri - Day 21")
    print("=" * 60 + "\n")

    tests = [
        test_recognize_uses_classroom_detector,
        test_session_objectid_cast,
        test_cors_not_wildcard,
        test_lazy_service_init,
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"FAIL - {test.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"ERROR - {test.__name__}: {e}")
            failed += 1

    print("\n" + "-" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)
