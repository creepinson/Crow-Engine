interface EXT_disjoint_timer_query_webgl2 {

    QUERY_COUNTER_BITS_EXT: number;
    TIME_ELAPSED_EXT: number;
    TIMESTAMP_EXT: number;
    GPU_DISJOINT_EXT: number;

    queryCounterEXT(query: number, target: number): void;

}