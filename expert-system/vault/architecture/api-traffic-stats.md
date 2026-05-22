# TTT API Traffic Statistics

Source: [Google Spreadsheet](https://docs.google.com/spreadsheets/d/15g1NrKHk2R1To3FFps69DGRPjhwKtxhxa9cFCnGSD8U/edit?gid=807595221)

## Top Endpoints by Hits (production data ~2020-2021)

| # | Hits | % | Visitors | Method | Endpoint |
|---|------|---|----------|--------|----------|
| 1 | 8,037,746 | 28.54% | 4,493 | GET | /api/ttt/ws (WebSocket) |
| 2 | 315,769 | 1.12% | 32,383 | POST | /api/ttt/v1/reports |
| 3 | 238,360 | 0.85% | 27,039 | GET | /api/ttt/v1/offices/2/periods/approve |
| 4 | 169,288 | 0.60% | 41,933 | GET | /api/vacation/v1/employees/current/warnings |
| 5 | 162,167 | 0.58% | 29,345 | GET | / |
| 6 | 159,453 | 0.57% | 43,875 | GET | /api/frontend/v1/jwt |
| 7 | 156,587 | 0.56% | 43,763 | GET | /api/ttt/actuator/info |
| 8 | 156,581 | 0.56% | 43,786 | GET | /api/ttt/v1/employees/current |
| 9 | 156,571 | 0.56% | 43,742 | GET | /api/ttt/v1/employees/current/permissions |
| 10 | 153,305 | 0.54% | 26,849 | GET | /report |
| 11 | 141,302 | 0.50% | 16,145 | GET | /api/ttt/v1/offices/4/periods/approve |
| 12 | 124,782 | 0.44% | 33,878 | GET | /manifest.json |
| 13 | 100,847 | 0.36% | 16,433 | POST | /api/ttt/v1/tasks |
| 14 | 92,498 | 0.33% | 2,555 | POST | /api/ttt/v1/selections |
| 15 | 67,950 | 0.24% | 19,679 | GET | /api/ttt/v1/employees/current/settings |

## Key Observations

- **WebSocket** dominates traffic (28.5% of all hits) — used for real-time collaboration
- **POST /v1/reports** is #2 — most used write endpoint (time reporting)
- **Office approve periods** checked very frequently (offices 2, 4, 10, 11)
- **Statistics endpoints** are called in triplets: `statistic/employees/projects` + `calendar/period` + legacy `/api/statistics`
- **Selections** (cell locking) — 92K hits but only 2,555 visitors (heavy use by power users)
- **Locks** — POST 42K / DELETE 30K (some locks not properly released?)

## Implications for Testing

1. **WebSocket stability** is critical — most used feature
2. **Report creation/editing** needs thorough testing (highest write traffic)
3. **Office period checks** happen on every page load — performance-sensitive
4. **Statistics** generates heavy load with parallel requests per date range
5. **Lock/unlock imbalance** suggests potential bugs in cell lock cleanup
