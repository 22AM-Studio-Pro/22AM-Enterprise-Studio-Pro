# Workflow JSON Specification

The workflow schema defines an array of nodes. Each node has an id and type. Examples:

- Task node
{
  "id": "t1",
  "type": "task",
  "task": "echo",
  "input": { "msg": "hello" }
}

- Sequence node
{
  "id": "s1",
  "type": "sequence",
  "nodes": [ ... ]
}

- Parallel node
{
  "id": "p1",
  "type": "parallel",
  "nodes": [ ... ]
}

- Conditional node
{
  "id": "c1",
  "type": "conditional",
  "condition": "input.value > 10",
  "then": { ... }
}

- Loop node
{
  "id": "l1",
  "type": "loop",
  "condition": "variables.count < 10",
  "body": { ... }
}
