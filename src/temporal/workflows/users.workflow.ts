import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { getUsers, getUserById } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function getUsersWorkflow(): Promise<string[]> {
  return await getUsers();
}

export async function getUserByIdWorkflow(id: number): Promise<string> {
  return await getUserById(id);
}