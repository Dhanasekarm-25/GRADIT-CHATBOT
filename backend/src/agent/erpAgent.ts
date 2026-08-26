import { z } from "zod";
import { tool } from "@langchain/core/tools";
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
  AIMessage,
} from "@langchain/core/messages";
import { getLLM } from "../llm/model.js";
import { Role } from "../auth/roles.js";
import { getStudentMarks } from "../tools/marksTool.js";
import { getStudentProfile } from "../tools/studentTool.js";
import { getStudentAttendance } from "../tools/attendanceTool.js";
import { getStudentFees } from "../tools/feesTool.js";
import { getFacultyAndClassTeachers } from "../tools/facultyTool.js";

export interface AgentContext {
  userId: string;
  role: Role;
  name?: string;
  activeClassScope?: string; // e.g. "MCA A", "MCA B", "MCA Gen AI A", "MCA Gen AI B"
}

export interface ChatResult {
  reply: string;
  toolsUsed: Array<{
    name: string;
    input: any;
    resultSummary: string;
    status: "success" | "rbac_denied" | "error";
  }>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates tools dynamically bound with the active user context
 */
export function createErpTools(user: AgentContext) {
  const marksTool = tool(
    async ({ studentQuery }) => {
      try {
        const marks = await getStudentMarks(
          { userId: user.userId, role: user.role },
          String(studentQuery)
        );
        if (!marks || marks.length === 0) {
          return `No marks records found for "${studentQuery}".`;
        }
        return JSON.stringify(marks);
      } catch (err: any) {
        return `Error fetching marks: ${err.message}`;
      }
    },
    {
      name: "get_student_marks",
      description:
        "Fetch academic marks, exam scores, and grades for a student using Student ID (1-200), Name (e.g. 'Akash', 'Chandru'), Register Number, or Email.",
      schema: z.object({
        studentQuery: z
          .string()
          .describe("Student ID number, full name, register number, or email"),
      }),
    }
  );

  const profileTool = tool(
    async ({ studentQuery, classFilter }) => {
      try {
        const profile = await getStudentProfile(
          { userId: user.userId, role: user.role },
          String(studentQuery),
          classFilter || user.activeClassScope
        );
        if (!profile) {
          return `No student profile found matching "${studentQuery}"${classFilter ? ` in class ${classFilter}` : ""}.`;
        }
        return JSON.stringify(profile);
      } catch (err: any) {
        return `Error fetching profile: ${err.message}`;
      }
    },
    {
      name: "get_student_profile",
      description:
        "Fetch student profile information by Student ID, Name, Register Number, or Email for any of the 200 students. When multiple students share the same name (e.g. Akash, Chandru, Arjun), returns all matching candidate students.",
      schema: z.object({
        studentQuery: z
          .string()
          .describe("Student ID, full name, register number, or email address"),
        classFilter: z
          .string()
          .optional()
          .describe(
            "Optional class section to narrow down search (e.g. 'MCA A', 'MCA B', 'MCA Gen AI A', 'MCA Gen AI B')"
          ),
      }),
    }
  );

  const attendanceTool = tool(
    async ({ studentQuery }) => {
      try {
        const attendance = await getStudentAttendance(
          { userId: user.userId, role: user.role },
          String(studentQuery)
        );
        if (!attendance || attendance.length === 0) {
          return `No attendance records found for "${studentQuery}".`;
        }
        return JSON.stringify(attendance);
      } catch (err: any) {
        return `Error fetching attendance: ${err.message}`;
      }
    },
    {
      name: "get_student_attendance",
      description:
        "Fetch attendance percentages and sessions for any student by Student ID, Name, Register Number, or Email.",
      schema: z.object({
        studentQuery: z
          .string()
          .describe("Student ID, full name, register number, or email"),
      }),
    }
  );

  const feesTool = tool(
    async ({ studentQuery }) => {
      try {
        const fees = await getStudentFees(
          { userId: user.userId, role: user.role },
          String(studentQuery)
        );
        if (!fees || fees.length === 0) {
          return `No fee records found for "${studentQuery}".`;
        }
        return JSON.stringify(fees);
      } catch (err: any) {
        return `Error fetching fees: ${err.message}`;
      }
    },
    {
      name: "get_student_fees",
      description:
        "Fetch tuition fee details, payment status (PAID/PARTIAL), total amount, amount paid, and balance due for any student by Student ID, Name, Register Number, or Email.",
      schema: z.object({
        studentQuery: z
          .string()
          .describe("Student ID, full name, register number, or email"),
      }),
    }
  );

  const facultyTool = tool(
    async ({ query }) => {
      try {
        const list = await getFacultyAndClassTeachers(query);
        return JSON.stringify(list);
      } catch (err: any) {
        return `Error fetching faculty: ${err.message}`;
      }
    },
    {
      name: "get_faculty_info",
      description:
        "Fetch faculty list, designated class teachers (who teaches / is class teacher for MCA A, MCA B, MCA Gen AI A, MCA Gen AI B), departments, and designations.",
      schema: z.object({
        query: z
          .string()
          .optional()
          .describe("Optional faculty name, department, or class name (e.g. 'MCA A', 'Anita')"),
      }),
    }
  );

  return [marksTool, profileTool, attendanceTool, feesTool, facultyTool];
}

/**
 * Execute the AI Agent conversation with Tool Calling & Clean Disambiguation
 */
export async function runErpAgent(
  user: AgentContext,
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<ChatResult> {
  const tools = createErpTools(user);
  const toolsByName = Object.fromEntries(tools.map((t) => [t.name, t]));
  const toolsUsed: ChatResult["toolsUsed"] = [];

  const systemPrompt = `You are GRADIT AI, the intelligent College ERP Assistant.

COLLEGE STRUCTURE (200 Students across 4 Sections of 50 students each):
- "MCA A" (IDs 1–50) • Class Teacher: Prof. Anita Sharma (Computer Applications)
- "MCA B" (IDs 51–100) • Class Teacher: Prof. Kumar S (Computer Applications)
- "MCA Gen AI A" (IDs 101–150) • Class Teacher: Prof. Priya R (Artificial Intelligence)
- "MCA Gen AI B" (IDs 151–200) • Class Teacher: Prof. Meena V (Artificial Intelligence)

CRITICAL INSTRUCTIONS FOR DISAMBIGUATION & CONCISE OUTPUT:
1. WHEN MULTIPLE STUDENTS MATCH A QUERY (e.g. "Arjun", "Akash", "Chandru", "Aadhya", "Aishwarya"):
   - Output ONLY a brief 1-line announcement:
     "Found **4 students** named **{Name}** across sections. Please select a student below to view their complete dossier:"
   - DO NOT print redundant raw text tables, DO NOT dump the first student's profile, and DO NOT ask the user to type "Reply with the Student ID...". The web interface displays interactive cards automatically.

2. WHEN AN EXACT STUDENT IS REQUESTED (by Student ID e.g. #5, #155 or specific section):
   - Display their verified academic dossier (IA 1 marks & grade, attendance percentage, tuition fee status & balance) in clean Markdown tables.

3. Always be concise, direct, and fast.
`;

  const messages: any[] = [
    new SystemMessage(systemPrompt),
    ...history.slice(-4).map((h) =>
      h.role === "user" ? new HumanMessage(h.content) : new AIMessage(h.content)
    ),
    new HumanMessage(userMessage),
  ];

  try {
    const llm = getLLM();
    const modelWithTools = llm.bindTools(tools);

    let response: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await modelWithTools.invoke(messages);
        break;
      } catch (err: any) {
        if (err.message?.includes("429") || err.message?.includes("Rate limit")) {
          await sleep(2000);
        } else {
          throw err;
        }
      }
    }

    if (!response) {
      throw new Error("Unable to get response from Groq. Please try again in a few seconds.");
    }

    messages.push(response);

    let iterations = 0;
    while (
      response.tool_calls &&
      response.tool_calls.length > 0 &&
      iterations < 3
    ) {
      iterations++;
      for (const toolCall of response.tool_calls) {
        const selectedTool = toolsByName[toolCall.name];
        let toolOutput: string;
        let status: "success" | "rbac_denied" | "error" = "success";

        if (!selectedTool) {
          toolOutput = `Tool ${toolCall.name} not found.`;
          status = "error";
        } else {
          try {
            toolOutput = await (selectedTool as any).invoke(toolCall.args);
          } catch (e: any) {
            toolOutput = `Tool execution error: ${e.message}`;
            status = "error";
          }
        }

        toolsUsed.push({
          name: toolCall.name,
          input: toolCall.args,
          resultSummary:
            toolOutput.length > 120
              ? toolOutput.substring(0, 120) + "..."
              : toolOutput,
          status,
        });

        messages.push(
          new ToolMessage({
            tool_call_id: toolCall.id || "tool_call",
            content: toolOutput,
          })
        );
      }

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          response = await modelWithTools.invoke(messages);
          break;
        } catch (err: any) {
          if (err.message?.includes("429") || err.message?.includes("Rate limit")) {
            await sleep(2000);
          } else {
            throw err;
          }
        }
      }
      messages.push(response);
    }

    let reply = "";
    if (typeof response.content === "string" && response.content.trim().length > 0) {
      reply = response.content;
    } else {
      const finalRes = await llm.invoke(messages);
      reply =
        typeof finalRes.content === "string"
          ? finalRes.content
          : JSON.stringify(finalRes.content);
    }

    return {
      reply,
      toolsUsed,
    };
  } catch (error: any) {
    return {
      reply: `⚠️ **Agent Notice**: ${error.message}`,
      toolsUsed,
    };
  }
}
