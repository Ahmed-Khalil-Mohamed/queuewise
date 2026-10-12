import { queuewise } from "../apps/queuewise/domain";
export const projects = [queuewise];
export const findProject = (id: string) =>
  projects.find((project) => project.id === id);
