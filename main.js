const dataModel = JSON.parse(`
{
  "tables": [
      {
          "name": "User",
          "fields": [
              {
                  "type": "text",
                  "name": "name",
                  "label": "Name",
                  "helptext": "Enter the full name of the user."
              },
              {
                  "type": "email-address",
                  "name": "email",
                  "label": "Email Address",
                  "helptext": "Enter the user's email address."
              },
              {
                  "type": "single-image",
                  "name": "photo",
                  "label": "Profile Photo",
                  "helptext": "Upload the user's profile photo."
              },
              {
                  "type": "selection",
                  "name": "role",
                  "label": "Role",
                  "helptext": "Select the user's role within the app.",
                  "options": [
                      "Vehicle Owner",
                      "Maintenance Staff"
                  ]
              }
          ]
      },
      {
          "name": "Vehicle",
          "fields": [
              {
                  "type": "text",
                  "name": "make",
                  "label": "Make",
                  "helptext": "Enter the make of the vehicle."
              },
              {
                  "type": "text",
                  "name": "model",
                  "label": "Model",
                  "helptext": "Enter the model of the vehicle."
              },
              {
                  "type": "text",
                  "name": "registrationNumber",
                  "label": "Registration Number",
                  "helptext": "Enter the vehicle's registration number."
              },
              {
                  "type": "link-table",
                  "name": "owner",
                  "label": "Owner",
                  "helptext": "Select the owner of the vehicle.",
                  "table": "User",
                  "linkField": "name"
              },
              {
                  "type": "sub-table",
                  "name": "maintenanceRecords",
                  "label": "Maintenance Records",
                  "helptext": "List of maintenance records for the vehicle.",
                  "table": "Maintenance Record"
              }
          ]
      },
      {
          "name": "Maintenance Record",
          "fields": [
              {
                  "type": "date-time",
                  "name": "dateOfService",
                  "label": "Date of Service",
                  "helptext": "Enter the date and time of the maintenance service."
              },
              {
                  "type": "link-table",
                  "name": "vehicle",
                  "label": "Vehicle",
                  "helptext": "Select the vehicle that was serviced.",
                  "table": "Vehicle",
                  "linkField": "registrationNumber"
              },
              {
                  "type": "rich-text",
                  "name": "serviceDetails",
                  "label": "Service Details",
                  "helptext": "Enter the details of the maintenance service."
              },
              {
                  "type": "sub-table",
                  "name": "maintenanceParts",
                  "label": "Maintenance Parts",
                  "helptext": "List of parts used in the maintenance service.",
                  "table": "Maintenance Parts"
              }
          ]
      },
      {
          "name": "Part",
          "fields": [
              {
                  "type": "text",
                  "name": "partNumber",
                  "label": "Part Number",
                  "helptext": "Enter the part number."
              },
              {
                  "type": "text",
                  "name": "name",
                  "label": "Name",
                  "helptext": "Enter the name of the part."
              },
              {
                  "type": "currency",
                  "name": "cost",
                  "label": "Cost",
                  "helptext": "Enter the cost of the part.",
                  "unit": "dollar",
                  "units": "dollars"
              }
          ]
      },
      {
          "name": "Maintenance Parts",
          "fields": [
              {
                  "type": "link-table",
                  "name": "maintenanceRecord",
                  "label": "Maintenance Record",
                  "helptext": "Link to the maintenance record.",
                  "table": "Maintenance Record",
                  "linkField": "dateOfService"
              },
              {
                  "type": "link-table",
                  "name": "part",
                  "label": "Part",
                  "helptext": "Select the part that was replaced or used.",
                  "table": "Part",
                  "linkField": "partNumber"
              },
              {
                  "type": "number",
                  "name": "quantity",
                  "label": "Quantity",
                  "helptext": "Enter the quantity of the part used.",
                  "unit": "piece",
                  "units": "pieces"
              },
              {
                  "type": "currency",
                  "name": "partCostAtTimeOfService",
                  "label": "Part Cost at Time of Service",
                  "helptext": "Enter the cost of the part at the time of service.",
                  "unit": "dollar",
                  "units": "dollars"
              }
          ]
      }
  ]
}
`);

const detectDataModelIssues = (dataModel) => {
  const adjacencyList = [];
  const dataModelIssues = [];
  const nodes = dataModel.tables.map((table) => table.name);

  dataModel.tables.forEach((table) => {
    const adjListEntry = [];

    // For each table, get its neighbours, check if they exist
    // From this, create an adjacency list, this represents the data model as a graph data structure
    const rel = {
      sourceTable: table.name,
      linkFields: table.fields.filter((field) =>
        ["sub-table", "link-table"].includes(field.type)
      ),
    };

    rel.linkFields.forEach((irel) => {
      if (!nodes.includes(irel.table)) {
        dataModelIssues.push({
          message: `Table "${irel.table}" referenced by field "${irel.name}" in source table "${rel.sourceTable}" does not exist.`,
          level: "error",
        });
      } else {
        // table exists, maybe target field does not exist
        const targetTable = dataModel.tables.find(
          (table) => table.name === irel.table
        );
        if (
          irel?.linkField &&
          !targetTable.fields
            .map((field) => field.name)
            .includes(irel.linkField)
        ) {
          dataModelIssues.push({
            message: `Field "${irel.linkField}" referenced by field "${irel.name}" in source table "${rel.sourceTable}" does not exist.`,
            level: "error",
          });
        }
      }

      if (irel.table === rel.sourceTable) {
        dataModelIssues.push({
          message: `Table "${rel.sourceTable}" is linked to itself.`,
          level: "error",
        });
      }

      idx = nodes.indexOf(irel.table);
      if (idx >= 0) {
        adjListEntry.push(nodes.indexOf(irel.table));
      }
    });

    adjacencyList.push(adjListEntry);
  });

  const dfs = (adjList, x) => {
    let visited = [];
    let stack = [];
    const dfsLoop = (adjList, x) => {
      visited.push(x);
      adjList[x].forEach((node) => {
        if (!stack.includes(node)) stack.push(node);
        if (!visited.includes(node)) {
          dfsLoop(adjList, node);
        }
      });
    };

    dfsLoop(adjList, x);

    return visited;
  };

  // Test reachability, create warnings for unreachable nodes
  const reachableNodes = new Array(nodes.length).fill(false);
  nodes.forEach((node) => {
    const reachable = dfs(adjacencyList, nodes.indexOf(node));
    if (reachable.length > 1)
      // ensure when starting at a node, add reachable if it has more than 1 neighbour
      reachable.forEach((r) => (reachableNodes[r] = true));
  });

  reachableNodes.forEach((reachable, i) => {
    if (!reachable && nodes[i] !== "User") {
      dataModelIssues.push({
        message: `Table ${nodes[i]} has no relationships with other nodes.`,
        level: "warning",
      });
    }
  });

  // get all the paths that are a cycle in the graph
  // Get Cycles is a variation of the DFS algorithm
  const getCycles = (adjList, start) => {
    let visited = [];
    let stack = [];
    let cycles = [];

    const dfsLoop = (adjList, x) => {
      visited.push(x);
      stack.push(x);

      adjList[x].forEach((node) => {
        if (!visited.includes(node)) {
          dfsLoop(adjList, node);
        } else if (stack.includes(node)) {
          // a cycle exists, add error
          cycles.push([...stack, node]);
        }
      });

      stack.pop();
    };

    dfsLoop(adjList, start);

    return cycles;
  };

  // get all the cycles in the graph, must do DFS starting from all nodes, since a cycle could start from any node and no order in nodes is guaranteed
  const cyclePaths = nodes
    .map((node) => getCycles(adjacencyList, nodes.indexOf(node)))
    .flat();
  cyclePaths.forEach((cyclePath) => {
    dataModelIssues.push({
      message: `Cycle detected: ${cyclePath
        .map((node) => nodes[node])
        .join(" -> ")}`,
      level: "error",
    });
  });

  return dataModelIssues;
};

const issues = detectDataModelIssues(dataModel);
console.log(issues);
