import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "githawk",
  eventKey: process.env.INNGEST_EVENT_KEY!, 
});
