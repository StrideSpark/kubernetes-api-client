import https = require('https');
import request = require('request');
import * as api from './api';
import { Cluster, Context, User } from './config_types';
export declare class KubeConfig {
    private static authenticators;
    /**
     * The list of all known clusters
     */
    'clusters': Cluster[];
    /**
     * The list of all known users
     */
    'users': User[];
    /**
     * The list of all known contexts
     */
    'contexts': Context[];
    /**
     * The name of the current context
     */
    'currentContext': string;
    /**
     * Root directory for a config file driven config. Used for loading relative cert paths.
     */
    'rootDirectory': string;
    getContexts(): Context[];
    getClusters(): Cluster[];
    getUsers(): User[];
    getCurrentContext(): string;
    setCurrentContext(context: string): void;
    getContextObject(name: string): Context | null;
    getCurrentCluster(): Cluster | null;
    getCluster(name: string): Cluster | null;
    getCurrentUser(): User | null;
    getUser(name: string): User | null;
    loadFromFile(file: string): void;
    applytoHTTPSOptions(opts: https.RequestOptions): void;
    applyToRequest(opts: request.Options): void;
    loadFromString(config: string): void;
    loadFromOptions(options: any): void;
    loadFromClusterAndUser(cluster: Cluster, user: User): void;
    loadFromCluster(pathPrefix?: string): void;
    loadFromDefault(): void;
    makeApiClient<T extends ApiType>(apiClientType: ApiConstructor<T>): T;
    private getCurrentContextObject;
    private applyHTTPSOptions;
    private applyAuthorizationHeader;
    private applyOptions;
}
export interface ApiType {
    setDefaultAuthentication(config: api.Authentication): any;
}
export interface ApiConstructor<T extends ApiType> {
    new (server: string): T;
}
export declare class Config {
    static SERVICEACCOUNT_ROOT: string;
    static SERVICEACCOUNT_CA_PATH: string;
    static SERVICEACCOUNT_TOKEN_PATH: string;
    static fromFile(filename: string): api.Core_v1Api;
    static fromCluster(): api.Core_v1Api;
    static defaultClient(): api.Core_v1Api;
    static apiFromFile<T extends ApiType>(filename: string, apiClientType: ApiConstructor<T>): T;
    static apiFromCluster<T extends ApiType>(apiClientType: ApiConstructor<T>): T;
    static apiFromDefaultClient<T extends ApiType>(apiClientType: ApiConstructor<T>): T;
}
export declare function bufferFromFileOrString(root?: string, file?: string, data?: string): Buffer | null;
export declare function findHomeDir(): string | null;
export interface Named {
    name: string;
}
export declare function findObject<T extends Named>(list: T[], name: string, key: string): T | null;
