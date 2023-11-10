const dataModel = JSON.parse(`
{
    "tables": [
        {
            "name": "Event",
            "fields": [
                {
                    "type": "text",
                    "name": "eventName",
                    "label": "Event Name",
                    "helptext": "Enter the name of the event."
                },
                {
                    "type": "rich-text",
                    "name": "description",
                    "label": "Description",
                    "helptext": "Provide a detailed description of the event."
                },
                {
                    "type": "text",
                    "name": "location",
                    "label": "Location",
                    "helptext": "Specify the location where the event will take place."
                },
                {
                    "type": "date-only",
                    "name": "startDate",
                    "label": "Start Date",
                    "helptext": "Select the start date of the event."
                },
                {
                    "type": "date-only",
                    "name": "endDate",
                    "label": "End Date",
                    "helptext": "Select the end date of the event."
                },
                {
                    "type": "rich-text",
                    "name": "additionalInformation",
                    "label": "Additional Information",
                    "helptext": "Include any additional information about the event."
                },
                {
                    "type": "single-image",
                    "name": "image",
                    "label": "Event Image",
                    "helptext": "Upload an image for the event."
                },
                {
                    "type": "sub-table",
                    "name": "sessions",
                    "label": "Sessions",
                    "table": "Session"
                }
            ]
        },
        {
            "name": "Session",
            "fields": [
                {
                    "type": "text",
                    "name": "sessionName",
                    "label": "Session Name",
                    "helptext": "Enter the name of the session."
                },
                {
                    "type": "rich-text",
                    "name": "description",
                    "label": "Description",
                    "helptext": "Provide a detailed description of the session."
                },
                {
                    "type": "text",
                    "name": "sessionLocation",
                    "label": "Location",
                    "helptext": "Specify the location where the session will take place."
                },
                {
                    "type": "date-only",
                    "name": "date",
                    "label": "Date",
                    "helptext": "Select the date of the session."
                },
                {
                    "type": "time-only",
                    "name": "startTime",
                    "label": "Start Time",
                    "helptext": "Select the start time of the session."
                },
                {
                    "type": "time-only",
                    "name": "endTime",
                    "label": "End Time",
                    "helptext": "Select the end time of the session."
                },
                {
                    "type": "single-image",
                    "name": "image",
                    "label": "Session Image",
                    "helptext": "Upload an image for the session."
                },
                {
                    "type": "sub-table",
                    "name": "sessionSpeakers",
                    "label": "Session Speakers",
                    "table": "SessionSpeaker"
                },
                {
                    "type": "sub-table",
                    "name": "sessionAttendees",
                    "label": "Session Attendees",
                    "table": "SessionAttendee"
                }
            ]
        },
        {
            "name": "User",
            "fields": [
                {
                    "type": "text",
                    "name": "name",
                    "label": "Name",
                    "helptext": "Enter the user's full name."
                },
                {
                    "type": "text",
                    "name": "title",
                    "label": "Title",
                    "helptext": "Enter the user's professional title."
                },
                {
                    "type": "single-image",
                    "name": "photo",
                    "label": "Photo",
                    "helptext": "Upload a profile photo of the user."
                },
                {
                    "type": "text",
                    "name": "organization",
                    "label": "Organization",
                    "helptext": "Enter the name of the organization the user is affiliated with."
                },
                {
                    "type": "email-address",
                    "name": "email",
                    "label": "Email Address",
                    "helptext": "Enter the user's email address."
                },
                {
                    "type": "selection",
                    "name": "role",
                    "label": "Role",
                    "options": [
                        "Event Organizer",
                        "Speaker",
                        "Attendee"
                    ],
                    "helptext": "Select the user's role within the app."
                }
            ]
        },
        {
            "name": "SessionSpeaker",
            "fields": [
                {
                    "type": "link-table",
                    "name": "speaker",
                    "label": "Speaker",
                    "table": "User",
                    "linkField": "name",
                    "helptext": "Link to the speaker's user profile."
                }
            ]
        },
        {
            "name": "SessionAttendee",
            "fields": [
                {
                    "type": "link-table",
                    "name": "attendee",
                    "label": "Attendee",
                    "table": "User",
                    "linkField": "name",
                    "helptext": "Link to the attendee's user profile."
                }
            ]
        }
    ]
}
`);

// Log to console
console.log(dataModel);

const adjacencyList = [];
const dataModelIssues = [];
const nodes = dataModel.tables.map((table) => table.name);
console.log("nodes", nodes);

// relationship errors
dataModel.tables.forEach((table) => {
  // For each table, get its neighbours, check if they exist
  const rel = {
    sourceTable: table.name,
    linkFields: table.fields.filter((field) =>
      ["sub-table", "link-table"].includes(field.type)
    ),
  };

  adjacencyList.push(rel.linkFields.map((irel) => nodes.indexOf(irel.table)));
});

console.log("adjList", adjacencyList);

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

console.log("dfs", dfs(adjacencyList, 0));
