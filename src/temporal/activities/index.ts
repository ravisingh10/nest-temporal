// Export activity function signatures for Temporal workflows
export async function getUsers(): Promise<string[]> {
  // This will be implemented by the worker binding
  throw new Error('Activity function should be implemented by worker');
}

export async function getUserById(id: number): Promise<string> {
  // This will be implemented by the worker binding
  throw new Error('Activity function should be implemented by worker');
}