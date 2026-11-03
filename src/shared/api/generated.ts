export interface paths {
    "/client-config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ClientConfigurationResponse"];
                        "application/json": components["schemas"]["ClientConfigurationResponse"];
                        "text/json": components["schemas"]["ClientConfigurationResponse"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/archives": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ArchiveDescriptor"][];
                        "application/json": components["schemas"]["ArchiveDescriptor"][];
                        "text/json": components["schemas"]["ArchiveDescriptor"][];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/imaging-orders/{orderId}/studies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    orderId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ImagingStudy"][];
                        "application/json": components["schemas"]["ImagingStudy"][];
                        "text/json": components["schemas"]["ImagingStudy"][];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    orderId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["LinkStudyRequest"];
                    "text/json": components["schemas"]["LinkStudyRequest"];
                    "application/*+json": components["schemas"]["LinkStudyRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ImagingStudy"];
                        "application/json": components["schemas"]["ImagingStudy"];
                        "text/json": components["schemas"]["ImagingStudy"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/imaging-orders/{orderId}/viewer-context": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    orderId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ViewerContextRequest"];
                    "text/json": components["schemas"]["ViewerContextRequest"];
                    "application/*+json": components["schemas"]["ViewerContextRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ViewerContextResponse"];
                        "application/json": components["schemas"]["ViewerContextResponse"];
                        "text/json": components["schemas"]["ViewerContextResponse"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/studies/{studyId}/viewer-frames": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    studyId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ViewerFrameRequest"];
                    "text/json": components["schemas"]["ViewerFrameRequest"];
                    "application/*+json": components["schemas"]["ViewerFrameRequest"];
                };
            };
            responses: {
                /** @description Validated raw unsigned 16-bit little-endian pixels (proof profile only). */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/octet-stream": string;
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/studies/{studyId}/dicomweb/{resource}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    studyId: string;
                    resource: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Authorized DICOM JSON metadata or bounded multipart frame bytes. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/dicom+json": Record<string, never>[];
                        "multipart/related": string;
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["SessionResponse"];
                        "application/json": components["schemas"]["SessionResponse"];
                        "text/json": components["schemas"]["SessionResponse"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/organizations/onboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["OnboardRequest"];
                    "text/json": components["schemas"]["OnboardRequest"];
                    "application/*+json": components["schemas"]["OnboardRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["OnboardResponse"];
                        "application/json": components["schemas"]["OnboardResponse"];
                        "text/json": components["schemas"]["OnboardResponse"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/memberships": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["MembershipRequest"];
                    "text/json": components["schemas"]["MembershipRequest"];
                    "application/*+json": components["schemas"]["MembershipRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Membership"];
                        "application/json": components["schemas"]["Membership"];
                        "text/json": components["schemas"]["Membership"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/patients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    page?: number;
                    pageSize?: number;
                };
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PatientPageResult"];
                        "application/json": components["schemas"]["PatientPageResult"];
                        "text/json": components["schemas"]["PatientPageResult"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["PatientRequest"];
                    "text/json": components["schemas"]["PatientRequest"];
                    "application/*+json": components["schemas"]["PatientRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Patient"];
                        "application/json": components["schemas"]["Patient"];
                        "text/json": components["schemas"]["Patient"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/patients/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["PatientSearchRequest"];
                    "text/json": components["schemas"]["PatientSearchRequest"];
                    "application/*+json": components["schemas"]["PatientSearchRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PatientPageResult"];
                        "application/json": components["schemas"]["PatientPageResult"];
                        "text/json": components["schemas"]["PatientPageResult"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/patients/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Patient"];
                        "application/json": components["schemas"]["Patient"];
                        "text/json": components["schemas"]["Patient"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/worklist/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["WorklistSearchRequest"];
                    "text/json": components["schemas"]["WorklistSearchRequest"];
                    "application/*+json": components["schemas"]["WorklistSearchRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["OrderContextResponsePageResult"];
                        "application/json": components["schemas"]["OrderContextResponsePageResult"];
                        "text/json": components["schemas"]["OrderContextResponsePageResult"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/imaging-orders/{id}/context": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["OrderContextResponse"];
                        "application/json": components["schemas"]["OrderContextResponse"];
                        "text/json": components["schemas"]["OrderContextResponse"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/imaging-orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["OrderRequest"];
                    "text/json": components["schemas"]["OrderRequest"];
                    "application/*+json": components["schemas"]["OrderRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ImagingOrder"];
                        "application/json": components["schemas"]["ImagingOrder"];
                        "text/json": components["schemas"]["ImagingOrder"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/worklist": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    status?: string;
                    page?: number;
                    pageSize?: number;
                };
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ImagingOrderPageResult"];
                        "application/json": components["schemas"]["ImagingOrderPageResult"];
                        "text/json": components["schemas"]["ImagingOrderPageResult"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/imaging-orders/{id}/transition": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["TransitionRequest"];
                    "text/json": components["schemas"]["TransitionRequest"];
                    "application/*+json": components["schemas"]["TransitionRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ImagingOrder"];
                        "application/json": components["schemas"]["ImagingOrder"];
                        "text/json": components["schemas"]["ImagingOrder"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/imaging-orders/{id}/claim": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ConcurrencyRequest"];
                    "text/json": components["schemas"]["ConcurrencyRequest"];
                    "application/*+json": components["schemas"]["ConcurrencyRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ImagingOrder"];
                        "application/json": components["schemas"]["ImagingOrder"];
                        "text/json": components["schemas"]["ImagingOrder"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/imaging-orders/{id}/schedule": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ScheduleRequest"];
                    "text/json": components["schemas"]["ScheduleRequest"];
                    "application/*+json": components["schemas"]["ScheduleRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Appointment"];
                        "application/json": components["schemas"]["Appointment"];
                        "text/json": components["schemas"]["Appointment"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/equipment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Equipment"][];
                        "application/json": components["schemas"]["Equipment"][];
                        "text/json": components["schemas"]["Equipment"][];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["EquipmentRequest"];
                    "text/json": components["schemas"]["EquipmentRequest"];
                    "application/*+json": components["schemas"]["EquipmentRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Equipment"];
                        "application/json": components["schemas"]["Equipment"];
                        "text/json": components["schemas"]["Equipment"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/imaging-orders/{id}/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Report"][];
                        "application/json": components["schemas"]["Report"][];
                        "text/json": components["schemas"]["Report"][];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ConcurrencyRequest"];
                    "text/json": components["schemas"]["ConcurrencyRequest"];
                    "application/*+json": components["schemas"]["ConcurrencyRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Report"];
                        "application/json": components["schemas"]["Report"];
                        "text/json": components["schemas"]["Report"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/reports/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ReportDetailResponse"];
                        "application/json": components["schemas"]["ReportDetailResponse"];
                        "text/json": components["schemas"]["ReportDetailResponse"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/reports/{id}/drafts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["VersionRequest"];
                    "text/json": components["schemas"]["VersionRequest"];
                    "application/*+json": components["schemas"]["VersionRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Report"];
                        "application/json": components["schemas"]["Report"];
                        "text/json": components["schemas"]["Report"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/reports/{id}/submit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ConcurrencyRequest"];
                    "text/json": components["schemas"]["ConcurrencyRequest"];
                    "application/*+json": components["schemas"]["ConcurrencyRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Report"];
                        "application/json": components["schemas"]["Report"];
                        "text/json": components["schemas"]["Report"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/reports/{id}/sign": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["SignRequest"];
                    "text/json": components["schemas"]["SignRequest"];
                    "application/*+json": components["schemas"]["SignRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Signature"];
                        "application/json": components["schemas"]["Signature"];
                        "text/json": components["schemas"]["Signature"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/reports/{id}/addenda": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["AddendumRequest"];
                    "text/json": components["schemas"]["AddendumRequest"];
                    "application/*+json": components["schemas"]["AddendumRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["Report"];
                        "application/json": components["schemas"]["Report"];
                        "text/json": components["schemas"]["Report"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ReportTemplate"][];
                        "application/json": components["schemas"]["ReportTemplate"][];
                        "text/json": components["schemas"]["ReportTemplate"][];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["TemplateRequest"];
                    "text/json": components["schemas"]["TemplateRequest"];
                    "application/*+json": components["schemas"]["TemplateRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ReportTemplate"];
                        "application/json": components["schemas"]["ReportTemplate"];
                        "text/json": components["schemas"]["ReportTemplate"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/templates/{id}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ConcurrencyRequest"];
                    "text/json": components["schemas"]["ConcurrencyRequest"];
                    "application/*+json": components["schemas"]["ConcurrencyRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ReportTemplate"];
                        "application/json": components["schemas"]["ReportTemplate"];
                        "text/json": components["schemas"]["ReportTemplate"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/templates/{id}/revoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ConcurrencyRequest"];
                    "text/json": components["schemas"]["ConcurrencyRequest"];
                    "application/*+json": components["schemas"]["ConcurrencyRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ReportTemplate"];
                        "application/json": components["schemas"]["ReportTemplate"];
                        "text/json": components["schemas"]["ReportTemplate"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/reports/{id}/transcripts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["TranscriptRequest"];
                    "text/json": components["schemas"]["TranscriptRequest"];
                    "application/*+json": components["schemas"]["TranscriptRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["DictationTranscript"];
                        "application/json": components["schemas"]["DictationTranscript"];
                        "text/json": components["schemas"]["DictationTranscript"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/reports/{id}/ai-draft": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ProposalRequest"];
                    "text/json": components["schemas"]["ProposalRequest"];
                    "application/*+json": components["schemas"]["ProposalRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AIProposal"];
                        "application/json": components["schemas"]["AIProposal"];
                        "text/json": components["schemas"]["AIProposal"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/reports/{id}/proposals/{proposalId}/review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                    proposalId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ReviewProposalRequest"];
                    "text/json": components["schemas"]["ReviewProposalRequest"];
                    "application/*+json": components["schemas"]["ReviewProposalRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ReviewProposalResponse"];
                        "application/json": components["schemas"]["ReviewProposalResponse"];
                        "text/json": components["schemas"]["ReviewProposalResponse"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    page?: number;
                    pageSize?: number;
                };
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AuditEventPageResult"];
                        "application/json": components["schemas"]["AuditEventPageResult"];
                        "text/json": components["schemas"]["AuditEventPageResult"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["MetricsResponse"];
                        "application/json": components["schemas"]["MetricsResponse"];
                        "text/json": components["schemas"]["MetricsResponse"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/knowledge/answers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["KnowledgeRequest"];
                    "text/json": components["schemas"]["KnowledgeRequest"];
                    "application/*+json": components["schemas"]["KnowledgeRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["GroundedAnswerResponse"];
                        "application/json": components["schemas"]["GroundedAnswerResponse"];
                        "text/json": components["schemas"]["GroundedAnswerResponse"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/facilities/{facilityId}/reports/{id}/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    facilityId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Signed report text download. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": string;
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Authentication required; body is not guaranteed. */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Rate limit reached; body is not guaranteed. */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
                /** @description Redacted Problem Details; authorization and concurrency remain server enforced. */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/problem+json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AIProposal: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            /** Format: uuid */
            reportId: string;
            /** Format: uuid */
            transcriptId: string;
            /** Format: uuid */
            templateId: string;
            /** Format: int32 */
            baseVersion: number;
            /** Format: uuid */
            baseConcurrencyToken: string;
            findings: string;
            provider: string;
            modelVersion: string;
            promptVersion: string;
            schemaVersion: string;
            sourcesJson: string;
            status: components["schemas"]["ProposalStatus"];
            reviewedBy: string | null;
        };
        AddendumRequest: {
            /** Format: uuid */
            expectedToken: string;
            reason: string;
        };
        Appointment: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            /** Format: uuid */
            orderId: string;
            /** Format: uuid */
            equipmentId: string;
            /** Format: int64 */
            startsAt: number;
            /** Format: int64 */
            endsAt: number;
            cancelled: boolean;
        };
        ArchiveDescriptor: {
            key: string;
            name: string;
        };
        AuditEvent: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            actorId: string;
            action: string;
            /** Format: uuid */
            entityId: string;
            reason: string | null;
        };
        AuditEventPageResult: {
            items: components["schemas"]["AuditEvent"][];
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            total: number;
        };
        CitationResponse: {
            /** Format: uuid */
            documentId?: string;
            title?: string;
            excerpt?: string;
            sourceUri?: string | null;
            /** Format: int32 */
            chunkNumber?: number;
        };
        ClientConfigurationResponse: {
            developmentAuthentication: boolean;
            simulatedMfaAllowed: boolean;
        };
        /** @description Comma-separated flags serialized by System.Text.Json; facility session roles are numeric bitmasks. */
        ClinicRole: string;
        ConcurrencyRequest: {
            /** Format: uuid */
            expectedToken: string;
        };
        DictationTranscript: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            /** Format: uuid */
            reportId: string;
            originalText: string;
            checkedText: string;
            language: string;
            checkedBy: string;
        };
        Equipment: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            name: string;
            modality: string;
            available: boolean;
        };
        EquipmentRequest: {
            name: string;
            modality: string;
        };
        FacilityAccessResponse: {
            /** Format: uuid */
            id: string;
            name: string;
            /** Format: int32 */
            roles: number;
        };
        GroundedAnswerResponse: {
            answer?: string;
            grounded?: boolean;
            provider?: string;
            citations?: components["schemas"]["CitationResponse"][];
        };
        ImagingAvailabilityResponse: {
            state: string;
            /** Format: int32 */
            linkedStudyCount: number;
            processingState: string;
        };
        ImagingOrder: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            /** Format: uuid */
            patientId: string;
            modality: string;
            bodyRegion: string;
            referral: string;
            priority: string;
            status: components["schemas"]["OrderStatus"];
            readonly assignedTo: string | null;
        };
        ImagingOrderPageResult: {
            items: components["schemas"]["ImagingOrder"][];
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            total: number;
        };
        ImagingStudy: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            /** Format: uuid */
            orderId: string;
            archiveKey: string;
            studyInstanceUid: string;
            verifiedBy: string;
        };
        KnowledgeRequest: {
            question?: string;
            documentIds?: string[];
        };
        LinkStudyRequest: {
            /** Format: uuid */
            expectedToken: string;
            archiveKey: string;
            studyInstanceUid: string;
        };
        Membership: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            userId: string;
            roles: components["schemas"]["ClinicRole"];
            active: boolean;
        };
        MembershipRequest: {
            userId: string;
            /** Format: int32 */
            roles: number;
            active: boolean;
        };
        MetricsResponse: {
            ordersByStatus: components["schemas"]["OrderStatusCountResponse"][];
            /** Format: int32 */
            pendingOutbox: number;
        };
        OnboardRequest: {
            organizationName: string;
            facilityName: string;
            timeZone: string;
        };
        OnboardResponse: {
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
        };
        OrderContextResponse: {
            order: components["schemas"]["ImagingOrder"];
            patient: components["schemas"]["Patient"] | null;
            patientAccess: string;
            originalReport: components["schemas"]["OriginalReportSummaryResponse"] | null;
            imaging: components["schemas"]["ImagingAvailabilityResponse"];
        };
        OrderContextResponsePageResult: {
            items: components["schemas"]["OrderContextResponse"][];
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            total: number;
        };
        OrderRequest: {
            /** Format: uuid */
            patientId: string;
            modality: string;
            bodyRegion: string;
            referral: string;
            priority: string;
        };
        /** @enum {string} */
        OrderStatus: "Requested" | "Scheduled" | "CheckedIn" | "Acquired" | "InReview" | "ReportDraft" | "Signed" | "Cancelled";
        OrderStatusCountResponse: {
            status: components["schemas"]["OrderStatus"];
            /** Format: int32 */
            count: number;
        };
        OriginalReportSummaryResponse: {
            status: components["schemas"]["ReportStatus"];
            /** Format: int32 */
            currentVersion: number;
            /** Format: int64 */
            createdAt: number;
        };
        Patient: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            identifier: string;
            identifierIssuer: string;
            displayName: string;
            /** Format: date */
            birthDate: string | null;
        };
        PatientPageResult: {
            items: components["schemas"]["Patient"][];
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            total: number;
        };
        PatientRequest: {
            identifier: string;
            identifierIssuer: string;
            displayName: string;
            /** Format: date */
            birthDate?: string | null;
        };
        PatientSearchRequest: {
            search?: string | null;
            /** Format: int32 */
            page?: number;
            /** Format: int32 */
            pageSize?: number;
        };
        ProblemDetails: {
            type?: string | null;
            title?: string | null;
            /** Format: int32 */
            status?: number | null;
            detail?: string | null;
            instance?: string | null;
        } & {
            [key: string]: unknown;
        };
        ProposalRequest: {
            /** Format: uuid */
            expectedToken: string;
            /** Format: uuid */
            transcriptId: string;
            /** Format: uuid */
            templateId: string;
        };
        /** @enum {string} */
        ProposalStatus: "PendingReview" | "Accepted" | "Rejected";
        Report: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            /** Format: uuid */
            orderId: string;
            /** Format: uuid */
            checkedTranscriptId: string | null;
            /** Format: uuid */
            parentReportId: string | null;
            amendmentReason: string | null;
            /** Format: int32 */
            kind: number;
            status: components["schemas"]["ReportStatus"];
            /** Format: int32 */
            readonly currentVersion: number;
        };
        ReportDetailResponse: {
            report: components["schemas"]["Report"];
            versions: components["schemas"]["ReportVersion"][];
            signatures: components["schemas"]["Signature"][];
            addenda: components["schemas"]["Report"][];
        };
        ReportRevisionProvenance: {
            schema: string;
            method: string;
            actorId: string;
            /** Format: uuid */
            baseVersionId: string | null;
            sections: components["schemas"]["ReportSectionOrigin"][];
            /** Format: uuid */
            proposalId: string | null;
            /** Format: uuid */
            transcriptId: string | null;
            /** Format: uuid */
            templateId: string | null;
            provider: string | null;
            modelVersion: string | null;
            promptVersion: string | null;
            proposalSchemaVersion: string | null;
        };
        ReportSectionOrigin: {
            section: string;
            origin: string;
            /** Format: uuid */
            sourceVersionId: string | null;
        };
        /** @enum {string} */
        ReportStatus: "Draft" | "PendingReview" | "Signed";
        ReportTemplate: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            name: string;
            language: string;
            modality: string;
            bodyRegion: string;
            structure: string;
            /** Format: int32 */
            version: number;
            published: boolean;
        };
        ReportVersion: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            /** Format: uuid */
            reportId: string;
            /** Format: int32 */
            number: number;
            examination: string;
            findings: string;
            impression: string;
            language: string;
            authorId: string;
            /** Format: int32 */
            contentSchemaVersion: number;
            indication: string | null;
            technique: string | null;
            provenance: components["schemas"]["ReportRevisionProvenance"] | null;
        };
        ReviewProposalRequest: {
            /** Format: uuid */
            expectedToken: string;
            accept: boolean;
            examination: string;
            impression: string;
            indication?: string | null;
            technique?: string | null;
            /** Format: int32 */
            contentSchemaVersion?: number;
        };
        ReviewProposalResponse: {
            report: components["schemas"]["Report"];
            proposal: components["schemas"]["AIProposal"];
        };
        ScheduleRequest: {
            /** Format: uuid */
            expectedToken: string;
            /** Format: uuid */
            equipmentId: string;
            /** Format: date-time */
            startsAt: string;
            /** Format: date-time */
            endsAt: string;
        };
        SessionResponse: {
            /** Format: uuid */
            organizationId: string;
            userId: string;
            canProvision: boolean;
            hasRecentMfa: boolean;
            facilities: components["schemas"]["FacilityAccessResponse"][];
        };
        SignRequest: {
            /** Format: uuid */
            expectedToken: string;
            requestKey: string;
        };
        Signature: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** Format: uuid */
            facilityId: string;
            /** Format: uuid */
            concurrencyToken: string;
            /** Format: int64 */
            createdAt: number;
            /** Format: uuid */
            reportVersionId: string;
            signedBy: string;
            contentHash: string;
            requestKey: string;
        };
        TemplateRequest: {
            name: string;
            language: string;
            modality: string;
            bodyRegion: string;
            structure: string;
            /** Format: int32 */
            version: number;
        };
        TranscriptRequest: {
            originalText: string;
            checkedText: string;
            language: string;
            confirmedByRadiologist: boolean;
        };
        TransitionRequest: {
            /** Format: uuid */
            expectedToken: string;
            status: string;
            reason: string;
        };
        VersionRequest: {
            /** Format: uuid */
            expectedToken: string;
            examination: string;
            findings: string;
            impression: string;
            language: string;
            indication?: string | null;
            technique?: string | null;
            /** Format: int32 */
            contentSchemaVersion?: number;
        };
        ViewerContextRequest: {
            /** Format: uuid */
            studyId: string;
        };
        ViewerContextResponse: {
            /** Format: int32 */
            contractVersion: number;
            /** Format: uuid */
            studyId: string;
            studyInstanceUid: string;
            support: string;
            instances: components["schemas"]["ViewerInstance"][];
        };
        ViewerFrameRequest: {
            seriesInstanceUid: string;
            sopInstanceUid: string;
            /** Format: int32 */
            frameNumber: number;
            expectedMetadataHash: string;
        };
        ViewerInstance: {
            studyInstanceUid: string;
            seriesInstanceUid: string;
            sopInstanceUid: string;
            sopClassUid: string;
            /** Format: int32 */
            rows: number;
            /** Format: int32 */
            columns: number;
            /** Format: int32 */
            frames: number;
            /** Format: int32 */
            bitsAllocated: number;
            /** Format: int32 */
            bitsStored: number;
            /** Format: int32 */
            highBit: number;
            /** Format: int32 */
            pixelRepresentation: number;
            photometricInterpretation: string;
            /** Format: int32 */
            samplesPerPixel: number;
            /** Format: double */
            rescaleSlope: number | null;
            /** Format: double */
            rescaleIntercept: number | null;
            pixelSpacing: number[] | null;
            imageOrientationPatient: number[] | null;
            imagePositionPatient: number[] | null;
            supported: boolean;
            unsupportedReason: string | null;
            metadataHash: string;
        };
        WorklistSearchRequest: {
            search?: string | null;
            status?: string | null;
            modality?: string | null;
            priority?: string | null;
            assignment?: string;
            assignedTo?: string | null;
            /** Format: date-time */
            createdFrom?: string | null;
            /** Format: date-time */
            createdTo?: string | null;
            sort?: string;
            /** Format: int32 */
            page?: number;
            /** Format: int32 */
            pageSize?: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
