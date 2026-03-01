export type SkillStatus = 'active' | 'draft' | 'error';

export interface Skill {
  id: number;
  name: string;
  /** Short description shown on the list card */
  description: string;
  status: SkillStatus;
  icon: string;
  usageCount: number;
  /** Full skill definition written in Markdown */
  markdown: string;
  createdAt: string;
  updatedAt: string;
}
