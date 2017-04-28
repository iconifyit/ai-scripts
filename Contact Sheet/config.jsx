/**
 * Global options object used to avoid having to pass a large number of variables in function calls.
 * @type {{
 *     ROWS          : int,
 *     COLS          : int,
 *     VOFF          : number,
 *     HOFF          : number,
 *     ROW_WIDTH     : number,
 *     COL_WIDTH     : number,
 *     FRM_WIDTH     : number,
 *     FRM_HEIGHT    : number,
 *     PG_WIDTH      : number,
 *     PG_HEIGHT     : number,
 *     PG_UNITS      : string,
 *     GUTTER        : number,
 *     SCALE         : number,
 *     AIFORMAT      : [*],
 *     SHRINK_TO_FIT : boolean,
 *     START_FOLDER  : string,
 *     FILENAME      : string,
 *     LOGGING       : boolean,
 *     LOG_FILE_PATH : string,
 *     DEBUG         : boolean,
 *     SKIP_COLS     : number,
 *     STRIP         : [*]
 * }}
 */
var CONFIG = {

    /**
     * Number of rows
     */

    ROWS: 10,

    /**
     * Number of columns
     */

    COLS: 10,

    /**
     * Top & bottom page margins
     */

    VOFF: 64,

    /**
     * Left & Right page margins
     */

    HOFF: 64,

    /**
     * Row height. This is set programmatically.
     */

    ROW_WIDTH: 64,

    /**
     * Column Height. This is set programmatically.
     */

    COL_WIDTH: 64,

    /**
     * @deprecated
     */
    FRM_WIDTH: 64,

    /**
     * @deprecated
     */
    FRM_HEIGHT: 64,

    /**
     * Artboard width
     *
     * 10 columns 128 px wide, with 64 px page margins
     */

    PG_WIDTH: 1120,

    /**
     * Artboard height
     *
     * 20 rows 128 px tall, with 64 px page margins
     */

    PG_HEIGHT: 1400,

    /**
     * Page Count
     */

    PG_COUNT: 1,

    /**
     * Not yet fully-implemented. Will support multiple units
     */

    PG_UNITS: "px",

    /**
     * @deprecated
     */

    GUTTER: 0,

    /**
     * Enter scale in percentage 1-100
     */

    SCALE: 100,

    /**
     * Illustrator version compatibility
     */

    AIFORMAT: Compatibility.ILLUSTRATOR10,

    /**
     * If the icon is larger than the cell size, shrink it to the cell size
     */

    SHRINK_TO_FIT: true,

    /**
     * Starting folder for folder selector dialog
     */

    START_FOLDER: "~/github/iconify",

    /**
     * The contact sheet file name
     */

    FILENAME: "contact-sheet",

    /**
     * Enable logging?
     */

    LOGGING: true,

    /**
     * Verbose logging output?
     */
    DEBUG: true,

    /**
     * @deprecated
     */

    SKIP_COLS: 0,

    /**
     * Not fully-implemented
     */

    STRIP: ["svg", "ai", "eps", "txt", "pdf"],

    /**
     * Presets folder path
     */
    PRESETS_FOLDER: '~/ai-contact-sheet/presets',

    /**
     * Log folder path
     */

    LOG_FOLDER: '~/ai-contact-sheet/logs/',

    /**
     * Log file location
     */

    LOG_FILE_PATH: '~/ai-contact-sheet/logs/' + Utils.doDateFormat(new Date()) + '-log.txt',

    /**
     * Default path separator
     */

    PATH_SEPATATOR: "/"
};