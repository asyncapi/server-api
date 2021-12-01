import { Router } from 'express';

export interface Routes {
  path?: string;
  router: Router;
}

export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: any;
}
