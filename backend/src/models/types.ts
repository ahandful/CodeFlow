export interface Repository {
  id: string;
  name: string;
  url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  repository_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface ReviewReport {
  id: string;
  review_id: string;
  total_commits: number;
  total_files_changed: number;
  total_lines_added: number;
  total_lines_deleted: number;
  report_data: string;
  created_at: string;
}

export interface CommitInfo {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
  files_changed: number;
  lines_added: number;
  lines_deleted: number;
}

export interface FileChange {
  file_path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  lines_added: number;
  lines_deleted: number;
}

export interface ReviewData {
  commits: CommitInfo[];
  file_changes: FileChange[];
  summary: {
    total_commits: number;
    total_files_changed: number;
    total_lines_added: number;
    total_lines_deleted: number;
    contributors: string[];
  };
}
