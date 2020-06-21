import { LogLevel } from './LogLevel';
import { ReadonlyMat3, ReadonlyMat4, ReadonlyVec4, ReadonlyVec3 } from 'gl-matrix';

export interface ILogHandler {

    startGroup(title: string): void;

    endGroup(): void;

    endFrame(): void;

    logString(logLevel: LogLevel, message: string): void;

    logObject(logLevel: LogLevel, object: any): void;

    logStackTrace(logLevel: LogLevel, message: any): void;

    logVec3(logLevel: LogLevel, vec: ReadonlyVec3): void;

    logVec4(logLevel: LogLevel, vec: ReadonlyVec4): void;

    logMat3(logLevel: LogLevel, mat: ReadonlyMat3): void;

    logMat4(logLevel: LogLevel, mat: ReadonlyMat4): void;

}