# TTT WebSocket Events

Source: [Google Spreadsheet](https://docs.google.com/spreadsheets/d/15g1NrKHk2R1To3FFps69DGRPjhwKtxhxa9cFCnGSD8U/edit?gid=807595221)

## Topics (subscription channels)

| Topic | Description |
|-------|-------------|
| `/topic/projects/{projectId}/tasks` | Task changes in project |
| `/topic/projects/{projectId}/members` | Project member changes |
| `/topic/employees/{login}/reports` | Employee report changes |
| `/topic/employees/{login}/assignments` | Employee assignment changes |
| `/topic/employees/{login}/selections` | Cell selection events |
| `/topic/employees/{login}/locks` | Cell lock/unlock events |

## Event Types

| Event | Description |
|-------|-------------|
| ADD | Entity created |
| PATCH | Entity updated (only changed fields) |
| DELETE | Entity removed (only id in value) |
| TASK_RENAME | Task renamed (contains list of affected reports/assignments) |
| SELECT | Cell selected (for collaborative editing) |
| LOCK | Cell editing locked |
| UNLOCK | Cell editing unlocked |

## Event Payload Structure

### Common fields
```json
{
  "type": "ADD|PATCH|DELETE|TASK_RENAME|SELECT|LOCK|UNLOCK",
  "emitterLogin": "mpotter",
  "timestamp": 1565320541408,
  "value": { ... }
}
```

### TaskReport events
- **ADD**: full report object (`id`, `task`, `effort`, `reportDate`, `state`)
- **PATCH**: only changed fields (`id` + updated fields)
- **DELETE**: `{ "id": 800047 }`
- **TASK_RENAME**: array of PATCH events for affected reports
- **SELECT**: `{ type: "TASK_REPORT", key: { employeeLogin, taskId, date }, fieldName, selectionOwnerLogin }`
- **LOCK/UNLOCK**: `{ type: "TASK_REPORT", key: { employeeLogin, taskId, date }, fieldName, lockOwnerLogin }`

### TaskAssignment events
- **ADD**: full assignment object (`id`, `task`, `date`, `employeeLogin`, `assignerLogin`, `nextAssignmentId`, `closed`)
- **PATCH**: only changed fields
- **DELETE**: `{ "id": 15 }`
- **TASK_RENAME**: array of PATCH events for affected assignments
- **SELECT**: `{ type: "TASK_ASSIGNMENT", key: { employeeLogin, taskId, date }, fieldName: "comment" }`
- **LOCK/UNLOCK**: `{ type: "TASK_ASSIGNMENT", key: { employeeLogin, taskId, date }, fieldName, lockOwnerLogin }`

### Task events
- **TASK_RENAME**: `{ executorLogin, since, sourceTask: { id, name, projectId, ... }, targetTask: { id, name, projectId, ... } }`
- **SELECT**: `{ type: "TASK", key: { taskId }, fieldName: "name" }`
- ADD/PATCH/DELETE/LOCK/UNLOCK — not implemented

### ProjectMember events
- **ADD**: `{ projectId, employeeLogin }`
- **DELETE**: `{ projectId, employeeLogin }`
- PATCH/TASK_RENAME/SELECT/LOCK/UNLOCK — not implemented
