import { Router } from 'express';

export interface Controller {
  path?: string;
  boot(): Router;
}

export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: any;
}
