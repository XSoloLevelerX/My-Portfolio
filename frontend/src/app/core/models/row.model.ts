import { Project } from './project.model';

/** One horizontal shelf. Mirrors RowDTO on the backend. */
export interface Row {
  key: string;
  title: string;
  items: Project[];
}
