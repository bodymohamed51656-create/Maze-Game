function generateMaze(rows = 31, cols = 31) {
    // التأكد أن الأبعاد أرقام فردية لضمان حوائط وممرات متناسقة
    if (rows % 2 === 0) rows++;
    if (cols % 2 === 0) cols++;

    // 1 = حائط شجري، 0 = طريق، 2 = المخرج
    const maze = Array.from({ length: rows }, () => Array(cols).fill(1));

    const stack = [];
    const startR = 1;
    const startC = 1;
    maze[startR][startC] = 0;
    stack.push([startR, startC]);

    const dirs = [
        [-2, 0], [2, 0], [0, -2], [0, 2]
    ];

    // 1. بناء المتاهة الأساسية كثيرة التفرعات (Recursive Backtracker)
    while (stack.length > 0) {
        // اختيار آخر عنصر بنسبة 85% أو عنصر عشوائي بنسبة 15% لزيادة التفرعات المعقدة
        const index = Math.random() < 0.85 ? stack.length - 1 : Math.floor(Math.random() * stack.length);
        const [r, c] = stack[index];

        // خلط الاتجاهات عشوائياً
        const shuffledDirs = dirs.sort(() => Math.random() - 0.5);
        let moved = false;

        for (const [dr, dc] of shuffledDirs) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && maze[nr][nc] === 1) {
                maze[r + dr / 2][c + dc / 2] = 0; // فتح الجدار الفاصل
                maze[nr][nc] = 0; // فتح الخلية الجديدة
                stack.push([nr, nc]);
                moved = true;
                break;
            }
        }

        if (!moved) {
            stack.splice(index, 1);
        }
    }

    // 2. كسر بعض الجدران الداخلية لعمل مسارات متعددة وتقاطعات (Braided Maze)
    // هذا يمنع وجود "طريق واحد فقط" ويخلق عدة طرق للوصول وتفرعات كثيرة
    for (let r = 2; r < rows - 2; r++) {
        for (let c = 2; c < cols - 2; c++) {
            if (maze[r][c] === 1) {
                // هل الجدار يفصل بين ممرين أفقيين أو رأسيين؟
                const horizontalPass = maze[r][c - 1] === 0 && maze[r][c + 1] === 0 && maze[r - 1][c] === 1 && maze[r + 1][c] === 1;
                const verticalPass = maze[r - 1][c] === 0 && maze[r + 1][c] === 0 && maze[r][c - 1] === 1 && maze[r][c + 1] === 1;

                // فتح 18% من هذه الجدران لعمل مفترقات طرق وحلقات التفاف
                if ((horizontalPass || verticalPass) && Math.random() < 0.18) {
                    maze[r][c] = 0;
                }
            }
        }
    }

    // 3. وضع المخرج (2) في أبعد ركن في المتاهة
    maze[rows - 2][cols - 2] = 2;
    // التأكد من فتح طريق يؤدي للمخرج
    maze[rows - 2][cols - 3] = 0;
    maze[rows - 3][cols - 2] = 0;

    return maze;
}

module.exports = { generateMaze };