/*повністю вставити зображення в квадрат*/
function calc_size(img) {
    let img_pos = img.getBoundingClientRect();
    if (img_pos.height <= img_pos.width) {
        img.style.height = '100%';
        img.style.width = 'auto';
    }
    if (img_pos.height > img_pos.width) {
        img.style.height = 'auto';
        img.style.width = '100%';
    }
}
//====================================

/*записати та отримати значення з localStorage*/
function save_val(id,val) {
    localStorage.setItem(id, val);
}

function get_val(id,val_if_no_val) {
    if (!localStorage.getItem(id)) {
        return val_if_no_val;
    }
    return localStorage.getItem(id);
}
//=====================================

/*випадкове ціле від і до*/
function randint(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}
//====================================

/*випадково перемішати масив*/
function shake_arr(arr) {
    for (i in arr) {
        let a = arr[i];
        let b_i = randint(0, arr.length - 1);
        arr[i] = arr[b_i];
        arr[b_i] = a;
    }
    return arr;
}
//==================================

