import {create_audio, loop_audio, play_audio, stop_audio, create_circle, 
        create_rectangle, create_sprite, create_text, create_triangle, 
        query_color, query_flip, query_id, query_position, query_rotation, 
        query_scale, query_text, update_color, update_flip, update_position, 
        update_rotation, update_scale, update_text, update_to_top, 
        gameobjects_overlap, input_key_down, input_left_mouse_down, 
        input_right_mouse_down, pointer_over_gameobject, build_game, 
        debug_log, enable_debug, get_game_time, get_loop_count, 
        query_pointer_position, set_dimensions, set_fps, set_scale, 
        update_loop} from "arcade_2d"; // Simply import everything

// Constants
/* ---------------------------------------------------------------- */

// Size parameters
const scale_base = 2;
const scale = scale_base * 240;
const scale_footbar = scale_base * 60;
const canvas_size = [scale, scale + scale_footbar];
const canvas_center = [scale * 0.5, scale * 0.5];

const top_pos = [scale * 0.5, scale * 0.1];
const title_pos = [scale * 0.5, scale * 0.4];
const btn_pos = [[scale * 0.5, scale * 0.55], [scale * 0.5, scale * 0.65], [scale * 0.5, scale * 0.75]];

const footbar_center = [scale * 0.5, scale + scale_footbar * 0.5];
const footbar_info_pos = [scale * 0.5, scale + scale_footbar * 0.2];
const footbar_score_pos = [scale * 0.5, scale + scale_footbar * 0.6];

const grid_scale = scale / 3;
const grid_radius = grid_scale * 0.45;
const grid_pos = [[grid_scale * 0.5, grid_scale * 0.5],
                  [grid_scale * 1.5, grid_scale * 0.5],
                  [grid_scale * 2.5, grid_scale * 0.5],
                  [grid_scale * 0.5, grid_scale * 1.5],
                  [grid_scale * 1.5, grid_scale * 1.5],
                  [grid_scale * 2.5, grid_scale * 1.5],
                  [grid_scale * 0.5, grid_scale * 2.5],
                  [grid_scale * 1.5, grid_scale * 2.5],
                  [grid_scale * 2.5, grid_scale * 2.5]];

const content_size_large = [2 * scale_base, 2 * scale_base];
const content_size_medium = [scale_base, scale_base];

// Texts
const title_start = "ISOTOPIC256";
const title_over = "GAME OVER";
const title_win = "YOU WIN!";

const footbar_info = ["TEAM HACHIMI", "SCORE", "Click to restart",
                      "CONGRATULATION!", "UPDATING", "Right-click to start",
                      "Right-click to return", "Right-click to return"]; // Indexed by game state

const btn_contents = ["play", "settings", "leaderboard"];

// Colors
const invisible = [0, 0, 0, 0];

const background_color = [187, 173, 160, 255];

const content_color_light = [249, 246, 242, 255];
const content_color_dark = [119, 110, 101, 255];

const musk_color_translucent = [250, 248, 239, 128];
const musk_color_solid = [250, 248, 239, 255];

const footbar_background_color = [250, 248, 239, 255];

const btn_color = [187, 173, 160, 255];

// Tile properties by type
// Indices (U for unstable):
// 0 -> empty, 1 -> 2H, 2 -> 4He, 3 -> 8Be(U), 4 -> 16O
// 5 -> 32P(U), 6 -> 64Ni, 7 -> 128Sn(U), 8 -> 256No
const tile_colors = [[205, 193, 180, 255],
                     [238, 228, 218, 255],
                     [237, 224, 200, 255],
                     [242, 177, 121, 255],
                     [245, 149, 99, 255],
                     [246, 124, 95, 255],
                     [246, 94, 59, 255],
                     [237, 207, 114, 255],
                     [237, 204, 97, 255]];
const tile_content_colors = [content_color_dark,
                            content_color_dark,
                            content_color_dark,
                            content_color_light,
                            content_color_light,
                            content_color_light,
                            content_color_light,
                            content_color_light,
                            content_color_light];
const tile_names = ["", "H", "He", "Be", "O", "P", "Ni", "Sn", "No"];
const tile_val_strs = ["", "2", "4", "8", "16", "32", "64", "128", "256"];
const tile_init_cnt = [-1, -1, -1, 6, -1, 24, -1, 96, -1];
const tile_init_cnt_strs = ["", "", "", "5", "", "23", "", "95", ""];
const tile_is_unstable = [false, false, false, true, false, true, false, true, false];

// Settings params
let sound_enable = true;
let sound_enable_str = "On";

// Create game objects
/* ---------------------------------------------------------------- */

// Background
const background = update_color(create_rectangle(scale, scale), background_color);

// Shaking effect
const shake_obj = [];

for (let i = 0; i < 9; i = i + 1) {
    shake_obj[i] = update_color(create_circle(grid_radius), invisible);
}

// Tiles
const tiles_obj = [];
const tiles_val_obj = [];
const tiles_name_obj = [];
const tiles_cnt_obj = [];

for (let i = 0; i < 9; i = i + 1) {
    tiles_obj[i] = update_color(create_circle(grid_radius), invisible);
    tiles_val_obj[i] = update_scale(create_text(""), content_size_medium);
    tiles_name_obj[i] = update_scale(create_text(""), content_size_large);
    tiles_cnt_obj[i] = update_scale(create_text(""), content_size_medium);
}

// Footbar
const footbar_background = update_color(create_rectangle(scale, scale_footbar), footbar_background_color);
const footbar_info_obj = update_color(update_scale(create_text(""),
                         content_size_medium), content_color_dark);
const footbar_score_obj = update_color(update_scale(create_text(""),
                          content_size_large), content_color_dark);

// Animators
const anim_emerge_obj = [];
const anim_vanish_obj = [];
const anim_move_obj = [];
const anim_merge_obj = [];
const anim_hide_obj = [];

for (let i = 0; i < 9; i = i + 1) {
    // Hide objects layer should be between tile layer and other anim layer
    anim_hide_obj[i] = update_color(create_circle(grid_radius), invisible);
}

for (let i = 0; i < 9; i = i + 1) {
    // State 1 anim layer
    anim_vanish_obj[i] = update_color(create_circle(grid_radius), invisible);
    anim_move_obj[i] = update_color(create_circle(grid_radius), invisible);
}

for (let i = 0; i < 9; i = i + 1) {
    // State 2 anim layer
    anim_emerge_obj[i] = update_color(create_circle(grid_radius), invisible);
    anim_merge_obj[i] = update_color(create_circle(grid_radius), invisible);
}

// Musks
const musk_game_start = update_color(create_rectangle(scale, scale), invisible);
const musk_game_over = update_color(create_rectangle(scale, scale), invisible);

// Texts on musks
const text_game_start = update_color(update_scale(create_text(""),
                        content_size_large), content_color_dark);
const text_game_over = update_color(update_scale(create_text(""),
                       content_size_large), content_color_dark);

const text_name_input = update_color(update_scale(create_text(""),
                        content_size_medium), content_color_dark);
const text_settings = update_color(update_scale(create_text(""),
                      content_size_large), content_color_dark);
const text_settings_item = update_color(update_scale(create_text(""),
                           content_size_medium), content_color_dark);
const text_leaderboard = update_color(update_scale(create_text(""),
                         content_size_large), content_color_dark);

// Start buttons
const btn_objs = [update_color(update_scale(create_circle(scale / 24), [6, 1]), invisible),
                  update_color(update_scale(create_circle(scale / 24), [6, 1]), invisible),
                  update_color(update_scale(create_circle(scale / 24), [6, 1]), invisible)];

const btn_texts = [update_color(update_scale(create_text(""), content_size_medium), content_color_light),
                   update_color(update_scale(create_text(""), content_size_medium), content_color_light),
                   update_color(update_scale(create_text(""), content_size_medium), content_color_light)];

// Sound effects
// Downloaded from https://pixabay.com/
// License at https://pixabay.com/service/license-summary/
const se_base_url = "https://raw.githubusercontent.com/LOnion1124/SICP-Project-Isotopic256pro/main/src/";
const se_merge = create_audio(se_base_url + "new-notification-04-326127.mp3", 1);
const se_start = create_audio(se_base_url + "system-notification-199277.mp3", 1);
const se_fail = create_audio(se_base_url + "error-011-352286.mp3", 1);
const se_win = create_audio(se_base_url + "level-up-02-199574.mp3", 1);
const se_pop = create_audio(se_base_url + "bubble-pop-06-351337.mp3", 1);
const se_move = create_audio(se_base_url + "swoosh-05-329226.mp3", 1);
const se_click = create_audio(se_base_url + "computer-mouse-click-351398.mp3", 1);
const se_notification = create_audio(se_base_url + "new-notification-014-363678.mp3", 1);

// Game data
/* ---------------------------------------------------------------- */

const game_tile_types = [];
const game_tile_cnts = [];
let game_score = 0;
let game_score_diff = 0;

// Game animation system
/* ---------------------------------------------------------------- */

// Timers
const anim_move_timer = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const anim_emerge_timer = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const anim_merge_timer = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const anim_vanish_timer = [0, 0, 0, 0, 0, 0, 0, 0, 0];

// Frame number
const anim_move_fcnt = 3;
const anim_emerge_fcnt = 3;
const anim_merge_fcnt = 4;
const anim_vanish_fcnt = 3;

// Helper functions
function anim_hide_tile(obj_idx)
{
    update_color(anim_hide_obj[obj_idx], tile_colors[0]);
}

// Move animation
const anim_move_type = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const anim_move_dis = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // Move distance in grids
let anim_move_dir = -1; // Move direction

function anim_move(obj_idx)
{
    function get_dest(dis, dir)
    {
        const offset = dir === 0 ? -3 * dis
                      : dir === 1 ? dis
                      : dir === 2 ? 3 * dis
                      : dir === 3 ? -dis : 0;
        return obj_idx + offset;
    }
    const dest = get_dest(anim_move_dis[obj_idx], anim_move_dir);
    
    if (anim_move_timer[obj_idx] === anim_move_fcnt) {
        // Animation start
        anim_hide_tile(obj_idx);
        update_color(anim_move_obj[obj_idx], tile_colors[anim_move_type[obj_idx]]);
    }
    
    function get_track_pos(idx, dis, dir)
    {
        const orig_pos = grid_pos[obj_idx];
        const dest_pos = grid_pos[dest];
        
        const dx = dest_pos[0] - orig_pos[0];
        const dy = dest_pos[1] - orig_pos[1];
        
        const track_p1 = [orig_pos[0] + math_floor(0.25 * dx),
                          orig_pos[1] + math_floor(0.25 * dy)];
        const track_p2 = [orig_pos[0] + math_floor(0.75 * dx),
                          orig_pos[1] + math_floor(0.75 * dy)];
        
        return [undefined, dest_pos, track_p2, track_p1];
    }
    
    if (anim_move_timer[obj_idx] > 0) {
        const pos = get_track_pos(obj_idx, anim_move_dis[obj_idx], anim_move_dir);
        update_position(anim_move_obj[obj_idx], pos[anim_move_timer[obj_idx]]);
        anim_move_timer[obj_idx] = anim_move_timer[obj_idx] - 1;
    }
}

function anim_move_all()
{
    for (let i = 0; i < 9; i = i + 1) {
        anim_move(i);
    }
}

// Emerge animation
function anim_emerge(obj_idx)
{
    if (anim_emerge_timer[obj_idx] === anim_emerge_fcnt) {
        // Animation start
        anim_hide_tile(obj_idx);
        update_color(anim_emerge_obj[obj_idx], tile_colors[game_tile_types[obj_idx]]);
    }
    if (anim_emerge_timer[obj_idx] > 0) {
        const scale_serial = [undefined, [0.9, 0.9], [0.7, 0.7], [0.4, 0.4]];
        update_scale(anim_emerge_obj[obj_idx], scale_serial[anim_emerge_timer[obj_idx]]);
        anim_emerge_timer[obj_idx] = anim_emerge_timer[obj_idx] - 1;
    }
}

function anim_emerge_all()
{
    for (let i = 0; i < 9; i = i + 1) {
        anim_emerge(i);
    }
}

//Merge animation
const anim_merge_occur = [0, 0, 0, 0, 0, 0, 0, 0];

function anim_merge(obj_idx)
{
    if (anim_merge_timer[obj_idx] === anim_merge_fcnt) {
        anim_hide_tile(obj_idx);
        update_color(anim_merge_obj[obj_idx], tile_colors[game_tile_types[obj_idx]]);
    }
    if (anim_merge_timer[obj_idx] > 0) {
        const scale_serial = [undefined, [1.5, 1.5], [1.6, 1.6], [1.5, 1.5], [0.4, 0.4]];
        update_scale(anim_merge_obj[obj_idx], scale_serial[anim_merge_timer[obj_idx]]);
        anim_merge_timer[obj_idx] = anim_merge_timer[obj_idx] - 1;
    }
}

function anim_merge_all()
{
    for (let i = 0; i < 9; i = i + 1) {
        anim_merge(i);
    }
}

// Vanish animation
const anim_vanish_type = [0, 0, 0, 0, 0, 0, 0, 0, 0];

function anim_vanish(obj_idx)
{
    if (anim_vanish_timer[obj_idx] === anim_vanish_fcnt) {
        // Animation start
        anim_hide_tile(obj_idx);
        update_color(anim_vanish_obj[obj_idx], tile_colors[anim_vanish_type[obj_idx]]);
    }
    if (anim_vanish_timer[obj_idx] > 0) {
        const scale_serial = [undefined, [0, 0], [0.4, 0.4], [0.9, 0.9]];
        update_scale(anim_vanish_obj[obj_idx], scale_serial[anim_vanish_timer[obj_idx]]);
        anim_vanish_timer[obj_idx] = anim_vanish_timer[obj_idx] - 1;
    }
}

function anim_vanish_all()
{
    for (let i = 0; i < 9; i = i + 1) {
        anim_vanish(i);
    }
}

// Animation state control: 0 -> not playing,
//                          1 -> top order anims, 2 -> second order anims...
let anim_state = 0;
// Play order: (vanish / move) -> (emerge / merge)

// State controls

function anim_is_playing()
{
    let flag = false;
    for (let i = 0; i < 9; i = i + 1) {
        if (anim_move_timer[i] > 0 || anim_emerge_timer[i] > 0 ||
            anim_merge_timer[i] > 0 || anim_vanish_timer[i] > 0) {
            flag = true;
            break;
        }
    }
    return flag;
}

function anim_update_state()
{
    if (anim_state === 0) {
        let flag1 = false;
        let flag2 = false;
        
        for (let i = 0; i < 9; i = i + 1) {
            if (anim_move_timer[i] > 0 || anim_vanish_timer[i] > 0) {
                flag1 = true;
            }
            if (anim_emerge_timer[i] > 0 || anim_merge_timer[i] > 0) {
                flag2 = true;
            }
        }
        
        if (flag1) { // State 1 anims to be played
            anim_state = 1;
            return 1;
        }
        if (!flag1 && flag2) { // No state 1 anims, direct to state 2
            anim_state = 2;
            return 1;
        }
    }
    if (anim_state === 1) {
        let flag1 = false;
        let flag2 = false;
        
        for (let i = 0; i < 9; i = i + 1) {
            if (anim_move_timer[i] > 0 || anim_vanish_timer[i] > 0) {
                flag1 = true;
            }
            if (anim_emerge_timer[i] > 0 || anim_merge_timer[i] > 0) {
                flag2 = true;
            }
        }
        
        // Switch to state 2 if
        // State 1 anims all played and state 2 anims to be played
        if (!flag1 && flag2) {
            // anim_clear(anim_move_obj); // Reset animation
            anim_state = 2;
            return 1;
        }
    }
    if (!anim_is_playing()) { // All anims played
        anim_state = 0;
    }
}

// Main animation functions

function anim_clear(obj)
{
    for (let i = 0; i < 9; i = i + 1) {
        update_color(obj[i], invisible);
        update_color(obj[i], invisible);
    }
}

function anim_clear_all()
{
    anim_clear(anim_move_obj);
    anim_clear(anim_vanish_obj);
    anim_clear(anim_emerge_obj);
    anim_clear(anim_merge_obj);
    anim_clear(anim_hide_obj);
}

function anim_play_all()
{
    if (anim_state === 1) {
        anim_move_all();
        anim_vanish_all();
    }
    if (anim_state === 2) {
        anim_emerge_all();
        anim_merge_all();
    }
}

// Shaking effect
/* ---------------------------------------------------------------- */

const shake_fcnt = 3;
let shake_timer = 0;

function shake_clear_all()
{
    for (let i = 0; i < 9; i = i + 1) {
        update_color(shake_obj[i], invisible);
    }
}

function shake_tile(obj_idx)
{
    const scale_serial = [[1.12, 1.12], [1.05, 1.05], [1, 1]];
    if (tile_is_unstable[game_tile_types[obj_idx]]) {
        update_scale(shake_obj[obj_idx], scale_serial[shake_timer]);
    }
}

function shake_all()
{
    // Enable shaking
    for (let i = 0; i < 9; i = i + 1) {
        if (tile_is_unstable[game_tile_types[i]]) {
            update_color(shake_obj[i], tile_colors[game_tile_types[i]]);
        } else {
            update_color(shake_obj[i], invisible);
        }
    }
    
    shake_timer = (shake_timer + 1) % shake_fcnt;
    for (let i = 0; i < 9; i = i + 1) {
        shake_tile(i);
    }
}

// Draw (based on game data)
/* ---------------------------------------------------------------- */

function draw_tile(obj_idx, type_id, cnt)
{
    // Main color
    update_color(tiles_obj[obj_idx], tile_colors[type_id]);
    // Name
    update_text(tiles_name_obj[obj_idx], tile_names[type_id]);
    update_color(tiles_name_obj[obj_idx], tile_content_colors[type_id]);
    // Value
    update_text(tiles_val_obj[obj_idx], tile_val_strs[type_id]);
    update_color(tiles_val_obj[obj_idx], tile_content_colors[type_id]);
    // Count
    update_text(tiles_cnt_obj[obj_idx], cnt > 0 ? stringify(cnt) : "");
    update_color(tiles_cnt_obj[obj_idx], tile_content_colors[type_id]);
}

function draw_tile_all()
{
    for (let i = 0; i < 9; i = i + 1) {
        draw_tile(i, game_tile_types[i], game_tile_cnts[i]);
    }
}

function draw_start()
{
    // Undraw settings & leaderboards
    update_text(text_settings, "");
    update_text(text_settings_item, "");
    update_text(text_leaderboard, "");
    // Undraw game over
    update_color(musk_game_over, invisible);
    update_text(text_game_over, "");
    // Draw game start
    update_color(musk_game_start, musk_color_solid);
    update_text(text_game_start, title_start);
    // Draw buttons
    for (let i = 0; i < 3; i = i + 1) {
        update_color(btn_objs[i], btn_color);
        update_text(btn_texts[i], btn_contents[i]);
    }
}

function draw_over()
{
    update_color(musk_game_over, musk_color_translucent);
    update_text(text_game_over, title_over);
}

function draw_win()
{
    update_color(musk_game_over, musk_color_translucent);
    update_text(text_game_over, title_win);
}

function draw_new_game()
{
    // Undraw name input & start musk
    update_color(musk_game_start, invisible);
    update_text(text_name_input, "");
}

function draw_game()
{
    draw_tile_all();
}

function draw_name_input()
{
    // Undraw game start (but keep musk)
    update_text(text_game_start, "");
    // Undraw buttons
    for (let i = 0; i < 3; i = i + 1) {
        update_color(btn_objs[i], invisible);
        update_text(btn_texts[i], "");
    }
    update_text(text_name_input, "Enter your name:");
}

function draw_settings()
{
    // Undraw game start (but keep musk)
    update_text(text_game_start, "");
    // Undraw buttons
    for (let i = 0; i < 3; i = i + 1) {
        update_color(btn_objs[i], invisible);
        update_text(btn_texts[i], "");
    }
    update_text(text_settings, "Settings");
}

function draw_leaderboard()
{
    // Undraw game start (but keep musk)
    update_text(text_game_start, "");
    // Undraw buttons
    for (let i = 0; i < 3; i = i + 1) {
        update_color(btn_objs[i], invisible);
        update_text(btn_texts[i], "");
    }
    update_text(text_leaderboard, "Leaderboard");
}

// Game control
/* ---------------------------------------------------------------- */

function set_tile(obj_idx, type_id, cnt)
{
    game_tile_types[obj_idx] = type_id;
    game_tile_cnts[obj_idx] = cnt;
}

function reset_tile(obj_idx, type_id)
{
    set_tile(obj_idx, type_id, tile_init_cnt[type_id]);
}

function reduce_tile_cnt(obj_idx)
{
    if (game_tile_cnts[obj_idx] === 1) {
        play_se(se_pop);
        // Call animator
        anim_vanish_timer[obj_idx] = anim_vanish_fcnt;
        anim_vanish_type[obj_idx] = game_tile_types[obj_idx];
        // Set score decrement
        game_score_diff = game_score_diff - math_pow(2, game_tile_types[obj_idx]);
        
        reset_tile(obj_idx, 0);
    }
    if (game_tile_cnts[obj_idx] > 1) {
        // Reduce count by 1
        game_tile_cnts[obj_idx] = game_tile_cnts[obj_idx] - 1;
    }
}

function reduce_tile_cnt_all()
{
    for (let i = 0; i < 9; i = i + 1) {
        reduce_tile_cnt(i);
    }
}

// Game logic functions
/* ---------------------------------------------------------------- */

// Direction id: 0 -> up, 1 -> right, 2 -> down, 3 -> left
const pos_by_dir = [[[0, 3, 6], [1, 4, 7], [2, 5, 8]],
                    [[2, 1, 0], [5, 4, 3], [8, 7, 6]],
                    [[8, 5, 2], [7, 4, 1], [6, 3, 0]],
                    [[0, 1, 2], [3, 4, 5], [6, 7, 8]]];

function try_move_and_match(dir_id)
{
    const lines = pos_by_dir[dir_id];

    const result_tile_types = [];
    const result_tile_cnts = [];
    for (let i = 0; i < 9; i = i + 1) {
        result_tile_types[i] = game_tile_types[i];
        result_tile_cnts[i] = game_tile_cnts[i];
    }
    
    // Line operations
    function move_by_line(line)
    {
        const types = [0, 0, 0];
        const cnts = [-1, -1, -1];
        let top = 0;
        for (let i = 0; i < 3; i = i + 1) {
            if (result_tile_types[line[i]] !== 0) {
                types[top] = result_tile_types[line[i]];
                cnts[top] = result_tile_cnts[line[i]];
                top = top + 1;
            }
        }
        for (let i = 0; i < 3; i = i + 1) {
            result_tile_types[line[i]] = types[i]; // Copy back to result
            result_tile_cnts[line[i]] = cnts[i];
        }
    }
    
    function match_by_line(line)
    {
        // Pick out values of the line
        const types = [];
        const cnts = [];
        for (let i = 0; i < 3; i = i + 1) {
            types[i] = result_tile_types[line[i]];
            cnts[i] = result_tile_cnts[line[i]];
        }
        
        let ds = 0;
        
        for (let i = 0; i < 2; i = i + 1) {
            if (result_tile_types[line[i]] !== 0 &&
                result_tile_types[line[i]] === result_tile_types[line[i + 1]]) {
                types[i] = types[i] + 1; // Match two tiles
                cnts[i] = tile_init_cnt[types[i]]; // Init count
                types[i + 1] = 0;
                cnts[i + 1] = tile_init_cnt[0];
                ds = ds + math_pow(2, types[i]); // Score increment
                break;
            }
        }
        
        for (let i = 0; i < 3; i = i + 1) {
            result_tile_types[line[i]] = types[i]; // Copy back to result
            result_tile_cnts[line[i]] = cnts[i];
        }
        
        return ds;
    }
    
    let ds = 0; // Delta score
    
    for (let i = 0; i < 3; i = i + 1) {
        move_by_line(lines[i]);
        ds = ds + match_by_line(lines[i]);
        move_by_line(lines[i]);
    }
    
    let flag = false; // Check valid move
    
    // Update main game
    for (let i = 0; i < 9; i = i + 1) {
        if (result_tile_types[i] !== game_tile_types[i]) {
            flag = true;
            break;
        }
    }

    return [result_tile_types, result_tile_cnts, flag, ds];
}

function collect_info_by_line(bef, aft) // Observe  move and merge info
{
    const tmp1 = []; // Stack for none-empty [index, type] in bef
    let top1 = 0;
    const tmp2 = []; // Same but aft
    let top2 = 0;
    
    for (let i = 0; i < 3; i = i + 1) {
        if (bef[i] !== 0) {
            tmp1[top1] = [i, bef[i]];
            top1 = top1 + 1;
        }
        if (aft[i] !== 0) {
            tmp2[top2] = [i, aft[i]];
            top2 = top2 + 1;
        }
    }
    
    const dest = [-1, -1, -1]; // Index of destination
    const merge_at = [0, 0, 0]; // Position of merge
    
    let p1 = 0;
    for (let p2 = 0; p2 < top2; p2 = p2 + 1) {
        if (p1 >= 3) {
            break;
        }
        // The key is for each tile in tmp2, find its corresponding tile in tmp1
        if (tmp1[p1][1] === tmp2[p2][1]) { // Not merged
            dest[tmp1[p1][0]] = tmp2[p2][0];
            p1 = p1 + 1;
            continue;
        }
        if (p1 <= 1 && tmp1[p1][1] + 1 === tmp2[p2][1] &&
            tmp1[p1][1] === tmp1[p1 + 1][1]) { // Merged
            dest[tmp1[p1][0]] = tmp2[p2][0];
            dest[tmp1[p1 + 1][0]] = tmp2[p2][0];
            merge_at[tmp2[p2][0]] = 1; // Merge at here
            p1 = p1 + 2;
            continue;
        }
    }

    const dis = [0, 0, 0]; // Move distance in index
    for (let i = 0; i < 3; i = i + 1) {
        dis[i] = dest[i] === -1 ? 0 : i - dest[i];
    }
    
    return [dis, merge_at];
}

// For move & merge animation
function collect_info(before, after, dir_id, move_res, merge_res)
{
    for (let i = 0; i < 9; i = i + 1) {
        move_res[i] = 0; // Reset result
        merge_res[i] = 0;
    }
    
    const lines = pos_by_dir[dir_id];
    for (let i = 0; i < 3; i = i + 1) {
        const line = lines[i];
        const line_before = [before[line[0]], before[line[1]], before[line[2]]];
        const line_after = [after[line[0]], after[line[1]], after[line[2]]];
        
        const line_info = collect_info_by_line(line_before, line_after);
        
        for (let j = 0; j < 3; j = j + 1) {
            move_res[line[j]] = line_info[0][j];
            merge_res[line[j]] = line_info[1][j];
        }
    }
}

function move_and_match(dir_id)
{
    // [0]: type, [1]: cnt, [2]: flag, [3]: score increment
    const try_result = try_move_and_match(dir_id);
    if (try_result[2]) {
        // Collect info for move & merge animation
        collect_info(game_tile_types, try_result[0], dir_id,
                     anim_move_dis, anim_merge_occur);
        
        anim_move_dir = dir_id;
        for (let i = 0; i < 9; i = i + 1) {
            if (anim_move_dis[i] !== 0) {
                anim_move_type[i] = game_tile_types[i];
                anim_move_timer[i] = anim_move_fcnt; // Call animator
            }
            if (anim_merge_occur[i] === 1) {
                play_se(se_merge);
                anim_merge_timer[i] = anim_merge_fcnt; // Call animator
            }
        }
        
        for (let i = 0; i < 9; i = i + 1) {
            set_tile(i, try_result[0][i], try_result[1][i]); // Update game
        }
        
        game_score_diff = game_score_diff + try_result[3];
    }
    return try_result[2];
}

// Add random tile
function emerge_random_tile()
{
    const empty_pos = [];
    let top = 0;
    for (let i = 0; i < 9; i = i + 1) {
        if (game_tile_types[i] === 0) {
            empty_pos[top] = i;
            top = top + 1;
        }
    }
    
    const rpos_idx = math_floor(math_random() * 1000) % top;
    const rpos = empty_pos[rpos_idx];
    const rtype = (math_random() > 0.9) ? 2 : 1; // 2H for 90%, 4He for 10%
    
    reset_tile(rpos, rtype);
    anim_emerge_timer[rpos] = anim_emerge_fcnt; // Call animator
}

// Check game over
function game_is_over()
{
    const try_valid = [try_move_and_match(0)[2],
                       try_move_and_match(1)[2],
                       try_move_and_match(2)[2],
                       try_move_and_match(3)[2]];
    return !(try_valid[0] || try_valid[1] || try_valid[2] || try_valid[3]);
}

function game_is_win()
{
    for (let i = 0; i < 9 ; i = i + 1) {
        if (game_tile_types[i] === 8) {
            return true;
        }
    }
    return false;
}

// Sound effects
/* ---------------------------------------------------------------- */

function play_se(se)
{
    if (sound_enable) {
        play_audio(se);
    }
}

// Name input interface
/* ---------------------------------------------------------------- */



// Settings
/* ---------------------------------------------------------------- */

function settings_update()
{
    update_text(text_settings_item, "Toggle Sound(1): " + sound_enable_str);
}

// Leaderboard
/* ---------------------------------------------------------------- */



// Footbar & scoreboard
/* ---------------------------------------------------------------- */

function update_footbar(state)
{
    update_text(footbar_info_obj, footbar_info[state[1]]);
    if (state[1] === 1) {
        update_text(footbar_score_obj, stringify(game_score));
    }
    if (state[1] === 0 || state[1] === 2 || state[1] === 3) {
        update_text(footbar_score_obj, "");
    }
    if (state[1] === 4) {
        const ds = math_abs(game_score_diff);
        const ds_str = (game_score_diff === 0 ? "---"
                        : game_score_diff > 0 ? "+" + stringify(ds)
                        : "-" + stringify(ds));
        update_text(footbar_score_obj, ds_str);
    }
}

// External control (call on state switch)
/* ---------------------------------------------------------------- */

function create_new_game()
{
    const rpos = math_floor(math_random() * 1000) % 9;
    for (let i = 0; i < 9; i = i + 1) {
        reset_tile(i, 0);
    }
    
    draw_new_game(); // Init canvas
    draw_tile_all();
    
    anim_clear_all();
    shake_clear_all();
    
    reset_tile(rpos, 1);
    anim_emerge_timer[rpos] = anim_emerge_fcnt; // Call emerge animator
    
    game_score = 0;
}

function start_game()
{
    draw_start();
}

function end_game_over()
{
    draw_tile_all();
    draw_over();
}

function end_game_win()
{
    draw_tile_all();
    draw_win();
}

function show_name_input()
{
    draw_name_input();
}

function show_settings()
{
    draw_settings();
}

function show_leaderboard()
{
    draw_leaderboard();
}

// On start
/* ---------------------------------------------------------------- */

// Initialization

function init_pos_all()
{
    // Position offset for content display
    function get_val_pos(i)
    {
        const offset_x = 0;
        const offset_y = -20 * scale_base;
        return [grid_pos[i][0] + offset_x, grid_pos[i][1] + offset_y];
    }
    
    function get_cnt_pos(i)
    {
        const offset_x = 0;
        const offset_y = 20 * scale_base;
        return [grid_pos[i][0] + offset_x, grid_pos[i][1] + offset_y];
    }
    
    // Initial positions
    
    // Background & musks
    update_position(background, canvas_center);
    update_position(musk_game_start, canvas_center);
    update_position(musk_game_over, canvas_center);

    update_position(text_game_start, title_pos);
    update_position(text_game_over, title_pos);
    
    update_position(text_name_input, top_pos);
    update_position(text_settings, top_pos);
    update_position(text_settings_item, canvas_center);
    update_position(text_leaderboard, top_pos);

    // Buttons
    for (let i = 0; i < 3; i = i + 1) {
        update_position(btn_objs[i], btn_pos[i]);
        update_position(btn_texts[i], btn_pos[i]);
    }
    
    for (let i = 0; i < 9; i = i + 1) {
        // Tiles
        update_position(tiles_obj[i], grid_pos[i]);
        update_position(tiles_name_obj[i], grid_pos[i]);
        update_position(tiles_val_obj[i], get_val_pos(i));
        update_position(tiles_cnt_obj[i], get_cnt_pos(i));
        // Animators
        update_position(anim_emerge_obj[i], grid_pos[i]);
        update_position(anim_vanish_obj[i], grid_pos[i]);
        update_position(anim_move_obj[i], grid_pos[i]);
        update_position(anim_merge_obj[i], grid_pos[i]);
        update_position(anim_hide_obj[i], grid_pos[i]);
        // Shakers
        update_position(shake_obj[i], grid_pos[i]);
    }
    
    // Footbar
    update_position(footbar_background, footbar_center);
    update_position(footbar_info_obj, footbar_info_pos);
    update_position(footbar_score_obj, footbar_score_pos);
}

init_pos_all();
draw_start();

// On update
/* ---------------------------------------------------------------- */

let input = -1;

function get_input()
{
    if (input_key_down("w") || input_key_down("ArrowUp")) {
        return 0;
    }
    if (input_key_down("d") || input_key_down("ArrowRight")) {
        return 1;
    }
    if (input_key_down("s") || input_key_down("ArrowDown")) {
        return 2;
    }
    if (input_key_down("a") || input_key_down("ArrowLeft")) {
        return 3;
    }
    function btn_available(idx)
    {
        return query_text(btn_texts[idx]) !== "" && 
               (pointer_over_gameobject(btn_objs[idx]) ||
               pointer_over_gameobject(btn_texts[idx]));
    }
    if (input_left_mouse_down()) {
        if (btn_available(0)) {
            return 5;
        }
        if (btn_available(1)) {
            return 6;
        }
        if (btn_available(2)) {
            return 7;
        }
        return 4;
    }
    if (input_right_mouse_down()) {
        return 8;
    }
    if (input_key_down("1")) {
        return 9;
    }
    
    return -1;
}

function global_debug(state)
{
    debug_log("fcnt: " + stringify(get_loop_count()));
    debug_log("game state " + stringify(state));
    debug_log("anim state " + stringify(anim_state));
    // debug_log("move: " + stringify(anim_move_timer));
    // debug_log("vanish: " + stringify(anim_vanish_timer));
    // debug_log("emerge: " + stringify(anim_emerge_timer));
    // debug_log("merge: " + stringify(anim_merge_timer));
    // debug_log("score: " + stringify(game_score));
    // debug_log("dscore: " + stringify(game_score_diff));
}

// Game state:
// state[0]: input result in last frame, for debounce
// state[1]: main state: 0 -> game start, 1 -> gaming, 
//                       2 -> game over, 3 -> game win,
//                       4 -> playing animation,
//                       5 -> name input, 6 -> setting, 7 -> leaderboard

// FSM manager
function update_state(state)
{
    if (state[1] === 0) {
        if (input === 5) { // Click play
            play_se(se_click);
            show_name_input();
            state[1] = 5; // Name input state
            return 1;
        }
        if (input === 6) { // Click settings
            play_se(se_click);
            show_settings();
            state[1] = 6;
            return 1;
        }
        if (input === 7) { // Click leaderboard
            play_se(se_click);
            show_leaderboard();
            state[1] = 7;
            return 1;
        }
    }
    if (state[1] === 1) {
        // Check game over
        if (game_is_over()) {
            play_se(se_fail);
            end_game_over();
            state[1] = 2; // Switch to game over
            return 1;
        }
        // Check game win
        if (game_is_win()) {
            play_se(se_win);
            end_game_win();
            state[1] = 3; // Switch to game win
            return 1;
        }
        // Check animation playing
        if (anim_is_playing()) {
            shake_clear_all(); // Reset shakers
            state[1] = 4;
            return 1;
        }
    }
    if (state[1] === 2) { // Game over
        if (anim_is_playing()) {
            state[1] = 4;
            return 1;
        }
        if (input === 4) {
            play_se(se_click);
            start_game();
            state[1] = 0; // Switch to game start
            return 1;
        }
    }
    if (state[1] === 3) { // Game win
        if (anim_is_playing()) {
            state[1] = 4;
            return 1;
        }
        if (input === 4) {
            play_se(se_click);
            start_game();
            state[1] = 0; // Switch to game start
            return 1;
        }
    }
    if (state[1] === 4) { // Animation is playing
        anim_update_state(); // Move to sub FSM of animation
        if (!anim_is_playing()) { // Animation over
            anim_clear_all();
            state[1] = 1; // Switch to gaming
            return 1;
        }
    }
    if (state[1] === 5) { // Name input
        if (input === 8) {
            play_se(se_start);
            create_new_game();
            state[1] = 4; // Switch to first animation
            return 1;
        }
    }
    if (state[1] === 6) { // Settings
        if (input === 8) {
            play_se(se_click);
            start_game();
            state[1] = 0; // Switch to game start
            return 1;
        }
    }
    if (state[1] === 7) { // Leaderboard
        if (input === 8) {
            play_se(se_click);
            start_game();
            state[1] = 0; // Switch to game start
            return 1;
        }
    }
    
    return 0; // State unchanged
}

const init_state = [-1, 0];
function on_update(state)
{
    // Initialize state
    for (let i = 0; i < 2; i = i + 1) {
        if (state[i] === undefined) {
            state[i] = init_state[i];
        }
    }
    
    // Update FSM
    update_state(state);
    
    // Handle inputa
    input = get_input();
    if (input === state[0]) { // Debounce
        input = -1;
    } else {
        state[0] = input;
    }
    
    // Game control
    if (state[1] === 1) { // Gaming
        shake_all(); // Shake effect
        draw_game(); // Main canvas control
        if (0 <= input && input <= 3) {
            game_score_diff = 0;
            const valid_move = move_and_match(input);
            if (valid_move) {
                play_se(se_move);
                reduce_tile_cnt_all();
                emerge_random_tile();
            }
            game_score = game_score + game_score_diff;
        }
    }
    if (state[1] === 4) {
        anim_play_all(); // Play animations
    }
    if (state[1] === 6) { // Settings
        settings_update();
        if (input === 9) {
            if (!sound_enable) { // Enable sound effects
                sound_enable = true;
                sound_enable_str = "On";
                play_se(se_notification);
            } else { // Disable sound effects
                sound_enable = false;
                sound_enable_str = "Off";
            }
        }
    }
    
    update_footbar(state);
    
    global_debug(state);
}

// enable_debug(); // Uncomment to enable debug mode
update_loop(state => on_update(state));

// set_fps(1);
set_dimensions(canvas_size);
build_game();