# 📘 Program JSON Structure Documentation

## 📌 Introduction

This document defines the standardized JSON structure used to represent program entries in the system.  
Each program must follow this schema to ensure consistency, maintainability, and compatibility with the frontend and backend systems.

---

## 📚 Table of Contents

- Overview
- Required Fields
- Optional Fields
- Field Specifications

---

## 🧱 Overview

Each program is represented as a single JSON object.

### Base Structure

```json
{
  "id": "CITY-CATEGORY-ID",
  "title": "Program Name",
  "date": "YYYY-MM-DD",
  "desc": "Short description of the program.",
  "tags": ["Tag1", "Tag2"],
  "icon_type": "LucideIconName",
  "icon_color": "text-blue-500",
  "button_text": "View Details",
  "requirements": ["Requirement 1", "Requirement 2"], // [Optional]
  "guidelines": [
    { "step": 1, "action": "First step description." },
    { "step": 2, "action": "Second step description." }
  ], // [Optional]
  "sources": [
    {
      "name": "Official Site",
      "url": "https://example.com",
      "type": "link"
    }
  ]
}
```

### Optional Fields

- Requirements and guidelines fields are optional because the hyperlink will redirect to the Source url which needs to be redirected directly to the source

### Field Specifications

- id => String
- title => String
- date => String
- desc => String
- tags => Array<String>
- icon_type => String (Please Refer to the Lucide React Icons)
- icon_color => String
- button_text => String (This will reflect as the CTA of each card)
- requirements => Array<String>
- guidelines => Array
  - step => String
  - action => String
- sources => Array
  - name => String
  - url => String
  - type => String
