export interface SearchFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'select' | 'date';
  options?: Array<{ label: string; value: string }>;
}

export interface PageState {
  page: number;
  pageSize: number;
}
