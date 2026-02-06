# AI Pipeline Diagrams

This document contains all visual diagrams for the NexAttend AI pipeline. These diagrams illustrate the system architecture, data flows, and component interactions.

---

## 1. System Architecture

High-level overview of the complete system showing all layers and their interactions.

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Web App]
        B[Webcam Capture Component]
        C[Attendance Session UI]
    end
    
    subgraph "API Layer"
        D[FastAPI Backend]
        E[Face Registration Endpoint]
        F[Face Detection Endpoint]
        G[Attendance Endpoints]
    end
    
    subgraph "AI Pipeline"
        H[Camera Service]
        I[Image Processor]
        J[Face Detector MTCNN]
        K[Face Recognizer DeepFace]
        L[Embedding Service]
    end
    
    subgraph "Data Layer"
        M[(MongoDB)]
        N[Student Records]
        O[Face Embeddings]
        P[Attendance Records]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    
    E --> H
    F --> H
    H --> I
    I --> J
    J --> K
    K --> L
    
    L --> M
    M --> N
    M --> O
    M --> P
    
    G --> M
    
    style H fill:#e1f5ff
    style I fill:#e1f5ff
    style J fill:#ffe1e1
    style K fill:#ffe1e1
    style L fill:#e1ffe1
    style M fill:#fff4e1
```

**Description:**
- Frontend handles user interaction and webcam capture
- API layer provides RESTful endpoints
- AI pipeline processes images through multiple stages
- Data layer stores student info, embeddings, and attendance records

---

## 2. Face Registration Flow

Sequence diagram showing the step-by-step process of registering a student's face.

```mermaid
sequenceDiagram
    participant U as Student/User
    participant F as Frontend
    participant API as FastAPI
    participant CS as Camera Service
    participant IP as Image Processor
    participant FD as Face Detector
    participant FR as Face Recognizer
    participant ES as Embedding Service
    participant DB as MongoDB
    
    U->>F: Clicks Register Face
    F->>F: Opens webcam
    U->>F: Captures photo
    F->>API: POST /faces/register (image file)
    
    API->>API: Validate image format
    API->>CS: Decode image to numpy array
    CS-->>API: Image array
    
    API->>IP: Preprocess image
    IP->>IP: Resize if needed
    IP->>IP: Convert BGR to RGB
    IP-->>API: Processed image
    
    API->>FD: Detect faces in image
    FD->>FD: Run MTCNN detection
    FD-->>API: List of detected faces
    
    alt No face detected
        API-->>F: Error: No face found
        F-->>U: Show error message
    else Multiple faces detected
        API-->>F: Error: Multiple faces
        F-->>U: Show error message
    else Exactly one face found
        API->>API: Extract face bounding box
        API->>IP: Crop face with padding
        IP-->>API: Cropped face image
        
        API->>FR: Generate embedding
        FR->>FR: Run DeepFace Facenet model
        FR-->>API: 128-dim embedding vector
        
        alt Embedding failed
            API-->>F: Error: Cannot generate embedding
            F-->>U: Show error message
        else Embedding success
            API->>ES: Validate embedding
            ES-->>API: Embedding valid
            
            API->>DB: Save embedding to user record
            DB-->>API: Success
            
            API-->>F: Success response
            F-->>U: Registration complete
        end
    end
```

**Description:**
- User captures or uploads photo
- System validates exactly one face present
- Face embedding generated and stored
- Error handling for edge cases

---

## 3. Face Recognition and Attendance Marking Flow

Sequence diagram showing real-time face recognition during attendance sessions.

```mermaid
sequenceDiagram
    participant T as Teacher
    participant F as Frontend
    participant API as FastAPI
    participant CS as Camera Service
    participant FD as Face Detector
    participant FR as Face Recognizer
    participant ES as Embedding Service
    participant DB as MongoDB
    
    T->>F: Start Attendance Session
    F->>API: POST /attendance/start (classroom_id)
    API->>DB: Create attendance session
    DB-->>API: Session ID
    API-->>F: Session started
    
    F->>F: Open webcam
    
    loop Every 2 seconds
        F->>CS: Capture frame
        CS-->>F: Frame image
        
        F->>API: POST /faces/recognize (frame)
        
        API->>FD: Detect faces
        FD->>FD: Run MTCNN on frame
        FD-->>API: List of detected faces [face1, face2, ...]
        
        loop For each detected face
            API->>FD: Crop face region
            FD-->>API: Cropped face image
            
            API->>FR: Generate embedding
            FR->>FR: Run DeepFace model
            FR-->>API: Query embedding vector
            
            API->>DB: Get all registered embeddings for classroom
            DB-->>API: Student embeddings list
            
            API->>ES: Identify student
            ES->>ES: Compare query vs all student embeddings
            ES->>ES: Calculate cosine distances
            ES->>ES: Find minimum distance
            
            alt Distance < Threshold (Match Found)
                ES-->>API: Student ID + confidence
                
                API->>DB: Check if already marked present
                
                alt Not yet marked
                    API->>DB: Mark student present
                    DB-->>API: Attendance recorded
                    API-->>F: Student identified (name, confidence)
                    F->>F: Display student name on screen
                    F-->>T: Show "John Doe marked present"
                else Already marked
                    API-->>F: Already present (skip)
                end
                
            else Distance >= Threshold (No Match)
                ES-->>API: Unknown face
                API-->>F: Face detected but not recognized
                F->>F: Display "Unknown person"
            end
        end
    end
    
    T->>F: Stop Attendance Session
    F->>API: POST /attendance/stop (session_id)
    API->>DB: Close session and save records
    DB-->>API: Final attendance list
    API-->>F: Session summary
    F-->>T: Display attendance report
```

**Description:**
- Teacher starts attendance session
- System continuously captures and processes frames
- Multiple faces processed simultaneously
- Duplicates prevented by checking existing records
- Session ends with complete attendance report

---

## 4. Component Interaction Flow

Flowchart showing detailed logic flow through AI components.

```mermaid
flowchart TD
    Start([Input: Raw Camera Frame]) --> IP[Image Processor]
    
    IP --> |Resize 640x480| IP1[Resized Frame]
    IP --> |Convert BGR to RGB| IP2[RGB Frame]
    IP1 --> IP2
    IP2 --> FD
    
    FD[Face Detector MTCNN] --> |Run 3-stage cascade| FD1{Faces Detected?}
    
    FD1 --> |No faces| End1([Return: Empty Result])
    FD1 --> |1+ faces| FD2[Extract Bounding Boxes]
    
    FD2 --> FD3[Filter by Confidence >= 0.90]
    FD3 --> FD4[Sort by Face Size]
    FD4 --> FD5[Return Face List]
    
    FD5 --> Loop{For Each Face}
    
    Loop --> Crop[Crop Face Region + Padding]
    Crop --> FR[Face Recognizer DeepFace]
    
    FR --> |Load Facenet Model| FR1[Generate Embedding]
    FR1 --> |128-dim vector| Embed[Embedding Vector]
    
    Embed --> Mode{Registration or Recognition?}
    
    Mode --> |Registration| Save[Save to Database]
    Save --> End2([Registration Complete])
    
    Mode --> |Recognition| ES[Embedding Service]
    ES --> |Load student embeddings| ES1[Compare with Database]
    ES1 --> |Calculate cosine distance| ES2[Find Best Match]
    
    ES2 --> Match{Distance < 0.40?}
    
    Match --> |Yes| ID[Return Student ID + Confidence]
    Match --> |No| Unknown[Return: Unknown Face]
    
    ID --> MoreFaces{More Faces?}
    Unknown --> MoreFaces
    
    MoreFaces --> |Yes| Loop
    MoreFaces --> |No| End3([Return: All Results])
    
    style Start fill:#e1f5ff
    style End1 fill:#ffe1e1
    style End2 fill:#e1ffe1
    style End3 fill:#e1ffe1
    style IP fill:#fff4e1
    style FD fill:#ffebe1
    style FR fill:#f0e1ff
    style ES fill:#e1fff4
```

**Description:**
- Shows decision branches and loops
- Handles both registration and recognition modes
- Processes multiple faces in sequence
- Final results aggregated and returned

---

## 5. Model Architecture and Data Flow

Detailed view of neural network layers and data transformations.

```mermaid
graph LR
    subgraph "Input Layer"
        A[Raw Image<br/>640x480x3 BGR]
    end
    
    subgraph "Preprocessing"
        B[Convert to RGB]
        C[Resize/Normalize]
    end
    
    subgraph "MTCNN Detection"
        D1[Stage 1: P-Net<br/>Proposal Network]
        D2[Stage 2: R-Net<br/>Refine Network]
        D3[Stage 3: O-Net<br/>Output Network]
    end
    
    subgraph "Face Extraction"
        E[Bounding Box<br/>x, y, w, h]
        F[Crop + Padding]
        G[Face Image<br/>160x160x3]
    end
    
    subgraph "DeepFace Facenet"
        H[Conv Layers]
        I[Inception Blocks]
        J[Fully Connected]
        K[L2 Normalization]
    end
    
    subgraph "Output Layer"
        L[Embedding Vector<br/>128 dimensions]
    end
    
    subgraph "Comparison"
        M[Database<br/>Embeddings]
        N[Cosine Similarity]
        O{Distance < 0.40?}
    end
    
    subgraph "Result"
        P[Match: Student ID]
        Q[No Match: Unknown]
    end
    
    A --> B
    B --> C
    C --> D1
    D1 --> D2
    D2 --> D3
    D3 --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> N
    M --> N
    N --> O
    O -->|Yes| P
    O -->|No| Q
    
    style A fill:#e1f5ff
    style D1 fill:#ffe1e1
    style D2 fill:#ffe1e1
    style D3 fill:#ffe1e1
    style H fill:#f0e1ff
    style I fill:#f0e1ff
    style J fill:#f0e1ff
    style L fill:#e1ffe1
    style P fill:#d4edda
    style Q fill:#f8d7da
```

**Description:**
- MTCNN uses 3-stage cascade for face detection
- DeepFace Facenet generates embeddings through deep CNN
- Cosine similarity used for comparing embeddings
- Threshold determines match or no match result

---

## Diagram Usage

These diagrams can be:
- Viewed directly in Markdown viewers that support Mermaid
- Rendered using Mermaid Live Editor (https://mermaid.live)
- Included in presentations and documentation
- Used for team onboarding and training

## Tools for Viewing

**Online:**
- Mermaid Live Editor: https://mermaid.live
- GitHub (automatic rendering)
- VS Code with Mermaid extension

**Offline:**
- VS Code with Mermaid Preview extension
- Typora (Markdown editor with Mermaid support)
- Export as PNG/SVG using Mermaid CLI

---

## Updating Diagrams

To update these diagrams:
1. Edit the Mermaid code blocks
2. Test in Mermaid Live Editor
3. Verify rendering in your viewer
4. Commit changes to repository

---

Created by: Viraj Jayasiri  
Date: Week 2 Day 10  
Branch: docs/ai-pipeline
