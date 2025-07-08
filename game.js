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
const grid_radius = 70;
const grid_pos = [[80, 80], [240, 80], [400, 80],
                  [80, 240], [240, 240], [400, 240],
                  [80, 400], [240, 400], [400, 400]];

// const content_color_invisible = [0, 0, 0, 0];
const content_color_light = [249, 246, 242, 255];
const content_color_dark = [119, 110, 101, 255];

const content_name_size = [4, 4];
const content_val_size = [2, 2];
const content_cnt_size = [2, 2];

// Properties for tile types

// Indices
// 0 -> empty, 1 -> 2H, 2 -> 4He, 3 -> 8Be(NS), 4 -> 16O
// 5 -> 32P(NS), 6 -> 64Ni, 7 -> 128Sn(NS), 8 -> 256No
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

// Create game objects

// Background
const background = update_color(create_rectangle(480, 480), [187, 173, 160, 255]);

// Tiles
const tiles_obj = [create_circle(grid_radius),
                   create_circle(grid_radius),
                   create_circle(grid_radius),
                   create_circle(grid_radius),
                   create_circle(grid_radius),
                   create_circle(grid_radius),
                   create_circle(grid_radius),
                   create_circle(grid_radius),
                   create_circle(grid_radius)];
const tiles_val_obj = [update_scale(create_text(""), content_val_size),
                       update_scale(create_text(""), content_val_size),
                       update_scale(create_text(""), content_val_size),
                       update_scale(create_text(""), content_val_size),
                       update_scale(create_text(""), content_val_size),
                       update_scale(create_text(""), content_val_size),
                       update_scale(create_text(""), content_val_size),
                       update_scale(create_text(""), content_val_size),
                       update_scale(create_text(""), content_val_size)];
const tiles_name_obj = [update_scale(create_text(""), content_name_size),
                        update_scale(create_text(""), content_name_size),
                        update_scale(create_text(""), content_name_size),
                        update_scale(create_text(""), content_name_size),
                        update_scale(create_text(""), content_name_size),
                        update_scale(create_text(""), content_name_size),
                        update_scale(create_text(""), content_name_size),
                        update_scale(create_text(""), content_name_size),
                        update_scale(create_text(""), content_name_size)];
const tiles_cnt_obj = [update_scale(create_text(""), content_cnt_size),
                       update_scale(create_text(""), content_cnt_size),
                       update_scale(create_text(""), content_cnt_size),
                       update_scale(create_text(""), content_cnt_size),
                       update_scale(create_text(""), content_cnt_size),
                       update_scale(create_text(""), content_cnt_size),
                       update_scale(create_text(""), content_cnt_size),
                       update_scale(create_text(""), content_cnt_size),
                       update_scale(create_text(""), content_cnt_size)];

// Game states
const game_tile_types = [];
const game_tile_cnts = [];

// Helper functions

//Tile set function
function reset_tile_type(obj_idx, type_id)
{
    // Game control
    game_tile_types[obj_idx] = type_id;
    game_tile_cnts[obj_idx] = tile_init_cnt[type_id];
    // Main color
    update_color(tiles_obj[obj_idx], tile_colors[type_id]);
    // Name
    update_text(tiles_name_obj[obj_idx], tile_names[type_id]);
    update_color(tiles_name_obj[obj_idx], tile_content_colors[type_id]);
    // Value
    update_text(tiles_val_obj[obj_idx], tile_val_strs[type_id]);
    update_color(tiles_val_obj[obj_idx], tile_content_colors[type_id]);
    // Init count
    update_text(tiles_cnt_obj[obj_idx], tile_init_cnt_strs[type_id]);
    update_color(tiles_cnt_obj[obj_idx], tile_content_colors[type_id]);
}

// Tile count update function
function reduce_tile_cnt(obj_idx)
{
    if (game_tile_cnts[obj_idx] === 1) {
        reset_tile_type(obj_idx, 0);
    }
    if (game_tile_cnts[obj_idx] > 1) {
        // Reduce count by 1
        game_tile_cnts[obj_idx] = game_tile_cnts[obj_idx] - 1;
        const cnt_str = stringify(game_tile_cnts[obj_idx]);
        update_text(tiles_cnt_obj[obj_idx], cnt_str);
    }
}

function reduce_tile_cnt_all()
{
    for (let i = 0; i < 9; i = i + 1) {
        reduce_tile_cnt(i);
    }
}

// Update tile
function update_tile(obj_idx, type_id, cnt)
{
    reset_tile_type(obj_idx, type_id);
    // Cover count
    update_text(tiles_cnt_obj[obj_idx], cnt > 0 ? stringify(cnt) : "");
}

// Position offset for content display
function get_val_pos(i)
{
    const offset_x = 0;
    const offset_y = -40;
    return [grid_pos[i][0] + offset_x, grid_pos[i][1] + offset_y];
}

function get_cnt_pos(i)
{
    const offset_x = 0;
    const offset_y = 40;
    return [grid_pos[i][0] + offset_x, grid_pos[i][1] + offset_y];
}

// Game logic functions

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
        for (let i = 0; i < 2; i = i + 1) {
            if (result_tile_types[line[i]] !== 0 &&
                result_tile_types[line[i]] === result_tile_types[line[i + 1]]) {
                types[i] = types[i] + 1; // Match two tiles
                cnts[i] = tile_init_cnt[types[i]]; // Init count
                types[i + 1] = 0;
                cnts[i + 1] = tile_init_cnt[0];
                break;
            }
        }
        for (let i = 0; i < 3; i = i + 1) {
            result_tile_types[line[i]] = types[i]; // Copy back to result
            result_tile_cnts[line[i]] = cnts[i];
        }
    }
    
    for (let i = 0; i < 3; i = i + 1) {
        move_by_line(lines[i]);
        match_by_line(lines[i]);
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

    return [result_tile_types, result_tile_cnts, flag];
}

function move_and_match(dir_id)
{
    // [0]: type, [1]: cnt, [2]: flag
    const try_result = try_move_and_match(dir_id);
    if (try_result[2]) {
        for (let i = 0; i < 9; i = i + 1) {
            update_tile(i, try_result[0][i], try_result[1][i]);
        }
    }
    return try_result[2];
}

// Add random tile
function add_random_tile()
{
    const empty_pos = [];
    let top = 0;
    for (let i = 0; i < 9; i = i + 1) {
        if (game_tile_types[i] === 0) {
            empty_pos[top] = i;
            top = top + 1;
        }
    }
    
    const rpos = math_floor(math_random() * 1000) % top;
    const rtype = (math_random() > 0.9) ? 2 : 1; // 2H for 90%, 4He for 10%
    reset_tile_type(empty_pos[rpos], rtype);
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

// Game control

// On start

// Initialize

// Initialize properties
update_position(background, [240, 240]);
for (let i = 0; i < 9; i = i + 1) {
    update_position(tiles_obj[i], grid_pos[i]);
    update_position(tiles_name_obj[i], grid_pos[i]);
    update_position(tiles_val_obj[i], get_val_pos(i));
    update_position(tiles_cnt_obj[i], get_cnt_pos(i));
}

function init_game()
{
    const rpos = math_floor(math_random() * 1000) % 9;
    for (let i = 0; i < 9; i = i + 1) {
        reset_tile_type(i, 0);
    }
    reset_tile_type(rpos, 1);
}
init_game();

// On update
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
}

function on_update(state)
{
    // Check game over
    if (game_is_over()) {
        init_game();
    }
    
    // Debounce: state[0] for dir last frame
    let dir = get_input();
    if (dir === state[0]) {
        dir = undefined;
    } else {
        state[0] = dir;
    }
    
    // Valid input
    if (dir !== undefined) {
        const valid_move = move_and_match(dir);
        if (valid_move) {
            reduce_tile_cnt_all();
            add_random_tile();
        }
    }
}
update_loop(state => on_update(state));

set_dimensions([480, 480]);
build_game();