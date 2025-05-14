
## Technical Design

## 1. Introduction

**Purpose**: Provide a design for the “Receive Money” (inbound) and “Send Money” (outbound) features of the online wallet.

**Scope**: Covers webhook ingestion and parsing for inbound transfers, idempotent storage, flexible client mapping using a single reference per client, on-demand XML generation for outbound payments.

**Tech Stack**: NestJS, PostgreSQL, BullMQ, Redis

----------

## 2. High-Level Requirements

-   **Receive Money (Inbound)**
    
    -   Accept bank webhooks format
        
    -   Parse payloads into individual transactions
        
    -   Store each transaction idempotently
        
    -   Attach transactions to the correct client via a per-client reference.
        
-   **Send Money (Outbound)**
    
    -   Accept payment requests via REST API
        
    -   Generate XML payload on demand
        
-   **Non-Functional**
    
    -   Handle bulk ingestion (1,000+ transactions) with low latency
        
    -   Support pausing and resuming workers without data loss
        
    -   Simplify adding new banks through configuration, not schema changes
        

----------

## 3. Architecture Overview

**Components**:

-   **Webhook Receiver**: NestJS Controller handles HTTP POST from banks
    
-   **Queue & Processing**: BullMQ on Redis enqueues parsing jobs, NestJS @Processor workers execute them
    
-   **Database**: PostgreSQL stores transactions, clients, and banks
    
-   **XML Service**: Stateless NestJS Injectable builds outbound XML
    

**Workflow**:

-   **Inbound**:
    
    1.  HTTP endpoint receives raw payload
        
    2.  Payload is enqueued into BullMQ
        
    3.  Parser worker splits lines, maps client and insert transactions
        
-   **Outbound**:
    
    1.  Client calls send money API
        
    2.  XML Service constructs <PaymentRequestMessage>
        
    3.  Controller returns XML to caller  

   <br><br> 

![](https://drive.google.com/uc?export=view&id=1e4frl4HzeHuWJqzTHjKD6vSX0CexPIvD)

<br><br>
----------
## 4. Data Model

```
clients
  id            BIGINT PK
  name          VARCHAR
  reference     VARCHAR   
  created_at    TIMESTAMP
  updated_at    TIMESTAMP
  
banks
  id            INT PK
  name          VARCHAR   
  created_at    TIMESTAMP
  updated_at    TIMESTAMP

transactions
  id                 BIGINT PK
  external_referene  VARCHAR
  bank_id            INT FK -> banks.id
  client_id          BIGINT FK -> clients.id NULLABLE
  amount             DECIMAL(18,2)
  deatails          JSONB  
  created_at       TIMESTAMP     
  UNIQUE(bank_id, external_ref)

failed_jobs
  id            BIGINT PK
  queue         VARCHAR 
  job_name      VARCHAR
  payload       JSONB     
  created_at     TIMESTAMP
```
<br><br>

![](https://drive.google.com/uc?export=view&id=1VmtcKJc-Sb0u6FIq_vcGu2Z5nZ_OeZ6m)

<br><br>

----------

## 5. API Design

```
POST /api/v1/payments/receive/:bank
Headers: Content-Type: text/plain, X-Bank-Signature
Body: raw text lines (one transaction per line)
Response: 200

POST /api/v1/payments/send
Headers: Content-Type: application/json, Authorization: Bearer <token>
Body: {
  "amount": 177.39,
  "currency": "SAR",
  "sender_account": "SA6980000204608016212908",
  "receiver_bank_code": "FDCSSARI",
  "receiver_account": "SA6980000204608016211111",
  "receiver_name": "Jane Doe",
  "notes": ["debt payment"],       // optional
  "payment_type": 421,             // omit if 99
  "charge_details": "RB"          // omit if SHA
}
Response: 200 OK with generated XML

```

----------

## 6. Processing Workflow

### 6.1 Receive Money

1.  **NestJS Controller**: authenticates and enqueues raw payload
    
2.  **Bank Parser**: parse transaction lines based on each bank format to json
    
3.  **BullMQ Processor**: maps client and insert transactions
    

### 6.2 Send Money

1.  **NestJS Controller**: validates request
    
2.  **XML Service**: builds <PaymentRequestMessage> according to schema rules
    
3.  **Controller**: returns XML response
    

### 6.3 Dead-Letter Queue Flow

-   **Configuration**: BullMQ queue is configured with defaultJobOptions.attempts and a backoff strategy.
    
-   **On Exhaustion**: After the specified retry attempts fail, the job is automatically moved to the Dead-Letter Queue (DLQ).
    
-   **DLQ Processor**: A dedicated NestJS @Processor listens on the DLQ and handles failed jobs by:
	    Inserting a record into the failed_jobs table with job metadata.
        
----------
## 7. Idempotency & Duplicate Handling

-   **Inbound**: use PostgreSQL ON CONFLICT (bank_id, external_ref) DO NOTHING
    

----------

## 8. Client Mapping

-   Store each user’s stable deposit identifier in clients.reference
    
-   If no match, client_id remains NULL (manual handle)
    

----------

## 9. Error Handling & Retries

-   **Inbound**:
    
    -   Parsing errors: skip malformed lines, log warning
        
    -   Transient failures: BullMQ retries with exponential backoff
        
    -   After all retries fail, job is moved to the dead-letter queue and a record is inserted into failed_jobs for manual inspection and possible reprocessing
        
-   **Outbound**:
    
    -   Validation errors: return 4xx immediately
        
    -   Builder errors: return 5xx and log details.
        

----------

## 10. Security Considerations

-   Verify webhook signatures (HMAC)
    
-   Authenticate and authorize send money requests via JWT
    
-   Rate-limit inbound webhook
    
----------
## 11. Testing Strategy

-   **Unit**: parsers for each bank format, XML Generator.
    
-   **Integration**: end-to-end webhook → DB, payment API → XML schema validation
    
-   **Performance**: simulate 1,000+ transactions, measure processing throughput and latency
    

----------