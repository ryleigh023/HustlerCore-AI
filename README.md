# HustlerCore AI

**Guidewire DEVTrails 2026 — Phase 1 Submission**

HustlerCore AI is an AI-powered parametric income insurance platform built exclusively for platform-based food delivery partners (Zomato / Swiggy). The platform protects gig workers against income loss caused by uncontrollable external disruptions — extreme weather, severe air pollution, and civic shutdowns — through automated trigger monitoring, instant payout processing, and intelligent fraud detection. There are no claims to file and no paperwork to submit. When a disruption threshold is breached, the system acts.

---

## Table of Contents

1. [Persona & Requirements](#1-persona--requirements)
2. [Persona-Based Scenarios & Application Workflow](#2-persona-based-scenarios--application-workflow)
3. [Weekly Premium Model & Parametric Triggers](#3-weekly-premium-model--parametric-triggers)
4. [Platform Justification](#4-platform-justification)
5. [AI/ML Integration Plan](#5-aiml-integration-plan)
6. [Tech Stack & Development Plan](#6-tech-stack--development-plan)
7. [Roadmap](#7-roadmap)

---

## 1. Persona & Requirements

**Chosen Segment:** Food Delivery Partners — Zomato and Swiggy

Food delivery partners represent India's largest and most weather-exposed gig workforce. Their income is entirely per-delivery with no fixed salary, no employer safety net, and no existing insurance mechanism against external disruptions. A single day of heavy rain or a severe AQI advisory in a metro city can eliminate 100% of a worker's daily earnings.

| Parameter | Detail |
|---|---|
| Average monthly income | Rs. 15,000 – Rs. 25,000 |
| Earnings model | Per-delivery, no fixed component |
| Income loss per disruption event | 20–30% of weekly earnings |
| Qualifying disruption frequency | 4–6 events per month (metro cities) |
| Existing safety net | None |

HustlerCore AI addresses this gap by providing a weekly, parametric income insurance policy that triggers automated payouts when pre-defined external disruption thresholds are breached — with no worker-initiated claims required.

**Coverage Scope:** Income loss only. The platform strictly excludes vehicle repairs, health insurance, accident medical bills, and personal injury claims of any nature.

---

## 2. Persona-Based Scenarios & Application Workflow

### Scenario A — Heavy Rainfall Event (Mumbai, Monsoon Season)

The India Meteorological Department issues a Red Alert for Zone 3 (Bandra–Andheri corridor). Rainfall accumulation crosses 64.5mm within a 24-hour window. The HustlerCore AI trigger monitoring pipeline detects this breach via the weather API time-series feed, cross-validates with a sharp drop in platform order volume for that zone, and identifies all active policyholders within the geo-fence. The fraud detection layer clears the batch. UPI payouts are initiated and credited within four minutes of trigger confirmation. Workers receive a push notification. No action is required on their part.

### Scenario B — Severe Air Quality Event (Delhi, Winter)

The CPCB AQI feed records a reading above 351 (Severe category) sustained for three or more continuous hours across Delhi NCR. GRAP Stage IV enforcement grounds outdoor activity. The trigger engine detects the sustained AQI sequence, the platform API confirms an order volume drop of over 70% against the hourly baseline, and the fraud model validates the behavioral cohort. Full-day payouts are processed for all eligible Pro Shield policyholders across affected zones.

### Scenario C — Zone Curfew or Local Strike

A local administrative order imposes a sudden zone curfew. The platform webhook reports zero order activity for two or more continuous hours. A concurrent civic alert feed entry confirms the curfew notice. The system cross-references worker GPS zone data, validates multi-source confirmation, and processes pro-rated payouts for the duration of the disruption window.

### Application Workflow

```
ONBOARDING
  Mobile number verification
  Aadhaar-based eKYC
  Zomato / Swiggy account ID linkage
  Delivery zone registration
  AI risk profiling (RNN)
  Weekly premium quote presented
  UPI payment confirmation
  Policy activated
        |
        v
CONTINUOUS MONITORING (Shallow LSTM — always running)
  Weather, AQI, Civic, and Platform APIs polled every 15 minutes
        |
        |--- No Threshold Breach ---> Continue monitoring
        |
        |--- Threshold Breach Confirmed
                    |
                    v
          DEEP RNN INVOKED
          Fraud sequence analysis
          Zone and activity validation
          Payout amount calculation
                    |
                    |--- Fraud Score < 0.30 ---> Auto-approve
                    |--- Fraud Score 0.30–0.70 -> Flag, non-blocking review
                    |--- Fraud Score > 0.70 ----> Hold for investigation
                    |
                    v
          UPI Payout Initiated (target: < 4 minutes from trigger)
          Push Notification Dispatched
          Policy Dashboard Updated
          Weekly Infoletter Queue Updated
```

---

## 3. Weekly Premium Model & Parametric Triggers

### Why Weekly Pricing

Gig delivery workers are paid on a per-delivery, per-day basis with no monthly salary structure. Monthly premium commitments represent an affordability barrier that is misaligned with how this workforce earns and spends. Weekly pricing matches their income cycle — workers insure the week they are about to work, paid from the week they just completed.

### Premium Tiers

All tiers are dynamically recalibrated at the start of each policy week by the Deep RNN risk model, based on the disruption probability forecast for the worker's registered zone over the coming seven days.

| Plan | Weekly Premium | Per-Disruption-Day Payout | Maximum Weekly Payout |
|---|---|---|---|
| Basic Shield | Rs. 49 | Rs. 150 | Rs. 600 |
| Standard Shield | Rs. 99 | Rs. 280 | Rs. 1,120 |
| Pro Shield | Rs. 149 | Rs. 400 | Rs. 1,600 |

**Premium Calculation Formula:**

```
Weekly Premium = Base Rate x Zone Risk Multiplier x Seasonal Disruption Index x Platform Activity Score

Base Rate            : Rs. 49 (low risk) to Rs. 149 (high risk)
Zone Risk Multiplier : 0.80 (low disruption zone) to 1.50 (high disruption zone)
Seasonal Disruption Index : Rolling 30-day disruption frequency for that zone
Platform Activity Score   : Avg active hours per day (higher activity = lower rate)
```

The Deep RNN model forecasts the seven-day disruption probability for each worker's zone at policy renewal. This forecast drives the tier recommendation — the system recommends the appropriate plan based on actual risk, not a fixed sales logic.

### Parametric Trigger Thresholds

| Disruption Type | Data Source | Trigger Condition | Coverage |
|---|---|---|---|
| Heavy Rainfall | IMD / OpenWeatherMap | >= 64.5 mm in 24 hours (Red Alert) | Full day |
| Extreme Heat | IMD | >= 45 degrees C with Heat Action Plan issued | Full day |
| Severe Air Pollution | CPCB / IQAir | AQI >= 351 sustained for >= 3 continuous hours | Full day |
| Moderate Rainfall | IMD | 35–64.4 mm (Orange Alert) | Half day |
| Elevated Air Pollution | CPCB | AQI 201–350 sustained for >= 4 continuous hours | Half day |
| Zone Curfew or Strike | Civic feeds and Platform API | Zero platform orders for >= 2 hours with civic confirmation | Pro-rated |
| Flash Flood Warning | NDMA | Flood warning issued for registered delivery zone | Full day |

All triggers are evaluated against time-series sequences by the Shallow LSTM model — not as single-point threshold checks. This captures the temporal progression of a disruption event rather than reacting to transient spikes.

---

## 4. Platform Justification

**Decision: Mobile-First Progressive Web Application (PWA)**

A PWA was selected over a native mobile application or a web-only platform based on the following operational realities of the target user:

| Factor | Rationale |
|---|---|
| Device access | Over 98% of delivery partners use Android smartphones as their primary device |
| Installation friction | A significant portion of gig workers avoid native app installations due to device storage constraints and mobile data costs |
| PWA capability | A PWA is browser-installable, supports push notifications, and functions in low-connectivity environments — without requiring Play Store distribution |
| Distribution | The platform URL can be distributed via WhatsApp by Zomato and Swiggy field operations teams, eliminating dependency on app store approval cycles |
| Payment | UPI deep-link integration is native and seamless on mobile browsers |
| Natural language access | Voice-input for the natural language inquiry feature operates natively within a mobile PWA |

A separate web-based dashboard for insurance operations and administrative functions will be maintained as a full web application.

---

## 5. AI/ML Integration Plan

HustlerCore AI is structured around a two-part hybrid intelligence architecture on the server side.

### Part 1: Hybrid LSTM-RNN Risk Intelligence Engine

The core intelligence is a hybrid of two sequential models — a Shallow LSTM for fast real-time classification and a Deep RNN for complex contextual analysis. The two models operate in a delegation hierarchy that optimizes both inference speed and computational cost.

**5.1 Shallow LSTM — Real-Time Trigger Classification**

The Shallow LSTM runs continuously as the always-on monitoring layer. It processes time-series data from external APIs as sequential input vectors and classifies whether an incoming disruption sequence constitutes a payable trigger event.

The model leverages the essential LSTM gate architecture — the input gate determines what new signal to incorporate, the forget gate discards irrelevant historical context, and the output gate produces the classification decision. This gate-based mechanism enables the model to capture temporal dependencies in disruption sequences — rising rainfall over three hours followed by an IMD alert elevation, for instance — that a static threshold rule would misclassify.

```
Input Sequence (12-hour rolling window, 15-minute sampling cadence):
  [rainfall_t-12, rainfall_t-6, rainfall_t-3, rainfall_t-1, rainfall_t0]
  [wind_speed, humidity, IMD_alert_level, platform_order_volume_delta]

Architecture: 2-layer LSTM
Output: Binary classification
  Class 1 — TRIGGER CONFIRMED, initiate payout pipeline
  Class 0 — NO TRIGGER, continue monitoring
```

The shallow (2-layer) architecture is deliberate. It keeps inference latency below 200 milliseconds, enabling continuous real-time monitoring on a low-cost EC2 instance, while delegating all complex contextual reasoning to the RNN layer above it.

**5.2 Deep RNN — Complex Risk Context and Fraud Reasoning**

The Deep RNN is invoked only when the LSTM confirms a trigger. It handles three tasks that require long-range temporal dependencies and multi-variable contextual analysis.

**Task A — Dynamic Weekly Premium Forecasting**

The RNN processes each worker's 52-week zone disruption history, city-level seasonal disruption patterns, and platform activity time-series to produce a risk score and a seven-day disruption probability forecast. The full deep learning pipeline applies: tokenization of zone-based event sequences, sequence padding to uniform length, dense embedding layers for zone and city encoding, and hyperparameter tuning via AWS SageMaker Automatic Model Tuning. This enables the model to capture long-range seasonal patterns — monsoon cycles, winter AQI spikes — that a regression model would not represent.

**Task B — Fraud Sequence Detection**

Fraud in parametric insurance manifests as sequential behavioral patterns across multiple events over time, not as single-point anomalies. The RNN is trained on 60-day behavioral histories per worker: claim frequency patterns, zone match scores, platform activity levels at the time of each event, and payout amount sequences. The model learns trajectories of suspicious behavior — for instance, a worker who claims on a high proportion of minor-severity events but not on severe ones, or whose GPS location migrates to a disruption boundary zone immediately prior to a threshold breach. These are temporal signatures that a static anomaly detector cannot reliably identify.

```
Output: Fraud probability score (0.0 to 1.0)
  Score < 0.30  : Auto-approve payout
  Score 0.30–0.70 : Flag for secondary review (non-blocking, payout proceeds)
  Score > 0.70  : Hold for manual investigation
```

The fraud engine is non-blocking by design. Workers are not penalized on suspicion. Scores between 0.30 and 0.70 trigger a parallel review without interrupting the payout flow.

Training pipeline: BPTT (Backpropagation Through Time), teacher forcing, tokenization of event sequences, sequence padding to 60-day uniform windows, dense embeddings for categorical features.

**Task C — Earnings Recovery Forecast**

Post-disruption, the RNN generates a personalized recovery projection for each affected worker: estimated days to recover lost income at their historical delivery rate, recommended high-activity hours and zones for the coming week, and a forward-looking income protection score. This output is surfaced in the worker-facing analytics dashboard.

**5.3 LSTM to RNN Delegation Architecture**

```
External API Streams (Weather / AQI / Civic / Platform)
                |
     SHALLOW LSTM (always running, low cost)
                |
    |-----------+------------|
  No Trigger              Trigger Confirmed
  Continue monitoring          |
                        INVOKE DEEP RNN
                        Fraud analysis
                        Premium recalibration
                        Recovery forecast
                               |
                  |------------+------------|
              Score < 0.30             Score > 0.70
              Auto-approve             Hold for review
                  |
        UPI Payout (< 4 minutes)
```

This architecture reduces compute cost by approximately 70–80% compared to running the full RNN continuously. The LSTM handles the always-on polling workload at minimal cost, and the RNN is invoked only when a trigger event requires contextual validation.

**5.4 Natural Language Inquiry**

A fine-tuned DistilBERT model serves a natural language inquiry interface on the worker app, enabling workers to ask questions about their coverage and payout history in plain Hindi or English without navigating application menus. The model is served from the same FastAPI inference endpoint cluster as the LSTM and RNN, maintaining a unified server-side inference layer.

### Part 2: Worker Application Intelligence Features

The server-side intelligence feeds nine worker-facing features in the mobile PWA:

| Feature | AI/ML Component |
|---|---|
| Priority Disruption Alerts and Policy Renewal Reminders | LSTM live trigger confidence + RNN 7-day disruption forecast |
| Custom Coverage Zones | K-Means zone clustering on geo-activity data |
| Payout History Filter and Policy Document Manager | LSTM disruption taxonomy applied to payout records |
| AI-Generated Earnings Recovery Plan | Deep RNN post-disruption temporal projection |
| Weekly Disruption Infoletter and Earnings Summary | RNN forecast + automated report generation |
| Post-Disruption Smart Recommendations | RNN contextual output — optimal zones and hours |
| Quick Payout Status Widget | LSTM real-time confidence level (Green / Amber / Red) |
| Natural Language Claim Inquiry | Fine-tuned DistilBERT (Hindi and English) |
| Income Protection Analytics Dashboard | Full RNN output — worker-facing and admin-facing views |

---

## 6. Tech Stack & Development Plan

### Frontend
- React.js (Progressive Web App with service workers for offline support)
- Tailwind CSS
- UPI Deep Link integration
- PWA web clip for persistent home-screen widget (Feature 7)

### Backend
- Node.js with Express (REST API and business logic layer)
- Python FastAPI (LSTM, RNN, and DistilBERT inference microservices)
- PostgreSQL (worker profiles, policies, payout records, audit trail)
- Redis (LSTM data stream buffer, trigger event cache, NL session state)

### AI/ML
- TensorFlow / Keras — Shallow LSTM (2-layer) and Deep RNN (4-layer with dropout)
- DistilBERT (fine-tuned) — Natural Language Inquiry interface
- Scikit-learn K-Means — Custom Coverage Zone clustering
- All models trained on AWS SageMaker and served via FastAPI on EC2

### External Integrations
- OpenWeatherMap API (weather time-series data)
- IQAir / CPCB API (AQI time-series data)
- NDMA alert feeds (civic disruption events)
- Razorpay UPI sandbox (payout simulation)
- Firebase Cloud Messaging (push notifications)
- Simulated platform webhooks for Zomato and Swiggy order volume data

### Infrastructure
- Docker (containerized services: LSTM, RNN, API, database)
- AWS SageMaker (model training and hyperparameter tuning)
- AWS EC2 (inference cluster with auto-scaling)
- AWS S3 (model artifacts, training data, payout records)
- Amazon CloudWatch (latency monitoring, model drift detection, SLA alerts)
- GitHub Actions (CI/CD pipeline)

### Development Plan

| Phase | Timeline | Deliverables |
|---|---|---|
| Phase 1: Ideation and Foundation | Weeks 1–2 | README documentation, architecture design, minimal PWA prototype, synthetic training dataset generation |
| Phase 2: Core Build | Weeks 3–4 | Shallow LSTM trigger engine v1, RNN premium forecasting model v1, worker onboarding flow, policy management API, UPI sandbox payout simulation, Features 1, 3, and 7 live |
| Phase 3: Intelligence and Integration | Weeks 5–6 | Deep RNN fraud sequence detector, all nine application features live, full AWS deployment, CloudWatch monitoring, end-to-end integration testing, performance benchmarking, analytics dashboard, final demonstration |

---

## 7. Roadmap

```
Phase 1 — Weeks 1 and 2 (Current)
  [x] Persona research and scenario definition
  [x] Hybrid LSTM-RNN architecture design
  [x] Parametric trigger thresholds defined and documented
  [x] README documentation
  [x] Minimal PWA prototype: onboarding and policy screens
  [x] Synthetic disruption time-series dataset for LSTM training
  [x] Synthetic worker behavioral dataset for RNN fraud training

Phase 2 — Weeks 3 and 4
  [ ] Shallow LSTM trigger classifier v1 deployed on EC2
  [ ] Deep RNN premium forecasting model v1 trained on SageMaker
  [ ] Real-time parametric trigger monitoring pipeline
  [ ] Worker onboarding and zone registration flow
  [ ] Policy creation and management API
  [ ] UPI sandbox payout simulation
  [ ] Features 1, 3, 7 live on PWA

Phase 3 — Weeks 5 and 6
  [ ] Deep RNN fraud sequence detector integrated and tested
  [ ] Natural language inquiry interface — DistilBERT on FastAPI
  [ ] Weekly Infoletter auto-generation pipeline
  [ ] Earnings Recovery Plan generation post-disruption
  [ ] Custom Coverage Zones with K-Means clustering
  [ ] Post-Disruption Smart Recommendations
  [ ] Income Protection Analytics Dashboard — worker and admin views
  [ ] Full AWS deployment: SageMaker, EC2, S3, CloudWatch
  [ ] End-to-end integration and regression testing
  [ ] Performance benchmarking: LSTM < 200ms, RNN < 2s, payout < 4 min
  [ ] Model drift monitoring configured in CloudWatch
  [ ] Final demonstration video and Phase 3 presentation
```

---

*HustlerCore AI — Guidewire DEVTrails 2026*

*Coverage scope: Income loss only. HustlerCore AI strictly excludes vehicle repairs, health insurance, accident medical bills, and personal injury claims. All payouts are parametric, triggered solely by objective external data and never by individual claim submissions.*
