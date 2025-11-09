import { JwtPayload } from "jsonwebtoken";
import { UserRole } from "../enums/role.enum";

export interface TokenPayload extends JwtPayload {
  role: UserRole;
  id: string;
  iat: number;
  exp: number;
}

export enum ExpUnit {
  Years = "Years",
  Year = "Year",
  Yrs = "Yrs",
  Yr = "Yr",
  Y = "Y",
  Weeks = "Weeks",
  Week = "Week",
  W = "W",
  Days = "Days",
  Day = "Day",
  D = "D",
  Hours = "Hours",
  Hour = "Hour",
  Hrs = "Hrs",
  Hr = "Hr",
  H = "H",
  Minutes = "Minutes",
  Minute = "Minute",
  Mins = "Mins",
  Min = "Min",
  M = "M",
  Seconds = "Seconds",
  Second = "Second",
  Secs = "Secs",
  Sec = "Sec",
  s = "s",
  Milliseconds = "Milliseconds",
  Millisecond = "Millisecond",
  Msecs = "Msecs",
  Msec = "Msec",
  Ms = "Ms",
}

type UnitAnyCase = ExpUnit | Uppercase<ExpUnit> | Lowercase<ExpUnit>;

export type StringValue =
  | `${number}`
  | `${number}${UnitAnyCase}`
  | `${number} ${UnitAnyCase}`;

/**
 * @swagger
 * components:
 *   schemas:
 *     JwtAuthResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refershToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
export interface JwtAuthResponse {
  accessToken: string;
  refershToken: string;
}
