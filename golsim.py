import random


class GameOfLife:
    def __init__(self):
        self.alive_cells = []

    def set_initial_state(self, alive_cells):
        self.alive_cells = alive_cells

    def get_alive_cells(self):
        return self.alive_cells

    def count_alive_cells(self):
        return len(self.alive_cells)

    def next_generation(self):
        new_alive_cells = []
        cells_to_check = set()

        # Add all alive cells and their neighbors to cellsToCheck
        for x, y in self.alive_cells:
            cells_to_check.add((x, y))
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if dx != 0 or dy != 0:
                        nx, ny = x + dx, y + dy
                        cells_to_check.add((nx, ny))

        for x, y in cells_to_check:
            alive_neighbors = sum(1 for dx in (-1, 0, 1) for dy in (-1, 0, 1)
                                  if (x + dx, y + dy) in self.alive_cells and (dx, dy) != (0, 0))

            if (x, y) in self.alive_cells:
                if 2 <= alive_neighbors <= 3:
                    new_alive_cells.append((x, y))
            else:
                if alive_neighbors == 3:
                    new_alive_cells.append((x, y))

        self.alive_cells = new_alive_cells

    def generate_glider(self, top_left_x, top_left_y):
        glider_pattern = [(0, 1), (1, 2), (2, 0), (2, 1), (2, 2)]
        self.alive_cells = [(top_left_x + dx, top_left_y + dy)
                            for dx, dy in glider_pattern]

    def get_extremes(self):
        min_x, max_x = 0, 0
        min_y, max_y = 0, 0
        for x, y in self.alive_cells:
            min_x = min(x, min_x)
            max_x = max(x, max_x)
            min_y = min(y, min_y)
            max_y = max(y, max_y)
        return [min_x, max_x, min_y, max_y]

    def generate_random_state(self, width, height, num_alive):
        alive_cells = set()
        while len(alive_cells) < num_alive:
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)
            alive_cells.add((x, y))
        return list(alive_cells)

    # checks that all neighbors of the pattern are valid (meaning all neighbors are dead cells)
    def pattern_neighbors(self, pattern):
        for cell in pattern:
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    neighbor = (cell[0] + dx, cell[1] + dy)
                    if neighbor not in pattern and neighbor in self.alive_cells:
                        return False
        return True

    def count_repeating_patterns(self):
        count = 0
        for (x, y) in self.alive_cells:
            # Check for 2x2 square pattern. the current cell being: bottom left, top left, top right, bottom right
            square_patterns = [(x, y), (x+1, y), (x, y+1)]
            if self.pattern_matched(square_patterns):
                count += 4
                # print("square")

            # Check for 1x3 horizontal pattern
            horizontal_bar = [(x, y), (x+1, y), (x+2, y)]
            if self.pattern_matched(horizontal_bar):
                count += 3
                # print("hbar")

            # Check for 1x3 vertical pattern
            vertical_bar = [(x, y), (x, y+1), (x, y+2)]
            if self.pattern_matched(vertical_bar):
                count += 3
                # print("vbar")

        return count

    def count_gliders(self):
        count = 0
        for (x, y) in self.alive_cells:
            # Patterns for valid gliders. bottom right, bottom left, top left,
            glider_patterns = [
                [(x, y), (x+1, y), (x+2, y), (x+2, y+1), (x+1, y+2)],
                [(x, y), (x+2, y), (x+2, y-1), (x+1, y-1), (x+1, y-2)],
                [(x, y), (x+1, y-1), (x+2, y-1), (x+2, y), (x+2, y+1)],
                [(x, y), (x+1, y-1), (x+2, y-1), (x+1, y-2), (x, y-2)],

                [(x, y), (x-1, y-1), (x-1, y-2), (x, y-2), (x+1, y-2)],
                [(x, y), (x-1, y-1), (x-1, y-2), (x-2, y), (x-2, y-1)],
                [(x, y), (x-1, y-1), (x-2, y-1), (x-2, y), (x-2, y+1)],
                [(x, y), (x-1, y-1), (x-1, y-2), (x-2, y-1), (x-2, y)],

                [(x, y), (x-1, y+1), (x-1, y+2), (x, y+2), (x+1, y+2)],
                [(x, y), (x-1, y+1), (x-1, y+2), (x-2, y+1), (x-2, y)],
                [(x, y), (x-1, y+1), (x-2, y+1), (x-2, y), (x-2, y-1)],
                [(x, y), (x-1, y+1), (x-1, y+2), (x, y+2), (x-2, y+1)],

                [(x, y), (x+1, y+1), (x+1, y+2), (x, y+2), (x-1, y+2)],
                [(x, y), (x+1, y+1), (x+1, y+2), (x+2, y+1), (x+2, y)],
                [(x, y), (x+1, y+1), (x+2, y+1), (x+2, y), (x+2, y-1)],
                [(x, y), (x+1, y+1), (x+1, y+2), (x, y+2), (x+2, y+1)]
            ]
            for pattern in glider_patterns:
                # print(pattern)
                if self.pattern_matched(pattern):
                    count += 1
        return count

    def pattern_matched(self, pattern):
        # Check if all cells in the pattern are alive
        for cell in pattern:
            if cell not in self.alive_cells:
                return False
        return self.pattern_neighbors(pattern)


def find_interesting_patterns():
    width, height = 25, 25

    steps = 300  # the amount of generations for each game
    success_condition = 1.5  # percentage of cells alive in order to save state

    # the percentage of cells that are on in the initial grid
    percentage_min, percentage_max = 10, 60
    max_state, max_count = [], 0
    max_glider_state, max_gliders = [], 0

    # interesting_arr = []
    min_x, min_x_state = 0, []
    min_y, min_y_state = 0, []
    max_x, max_x_state = 0, []
    max_y, max_y_state = 0, []

    for experiment in range(300):
        game = GameOfLife()

        percentage = random.randint(percentage_min, percentage_max) / 100
        initial_cells_alive = int(percentage * width * height)
        threshold = int(success_condition*initial_cells_alive)

        initial_state = game.generate_random_state(
            width, height, initial_cells_alive)

        game.set_initial_state(initial_state)
        # game.generate_glider(0, 0)
        # game.alive_cells = [(0, 0), (1, 0), (2, 0), (2, 1), (1, 2)]

        for _ in range(steps):
            game.next_generation()

        # alive_count, repeat_count = game.count_alive_cells(), game.count_repeating_patterns()
        gliders = game.count_gliders()
        # if alive_count > max_count:
        #     max_state = initial_state
        extremes = game.get_extremes()
        if gliders > max_gliders:
            max_glider_state = initial_state
            max_gliders = gliders

        if extremes[0] < min_x:
            min_x_state = initial_state
            min_x = extremes[0]
        if extremes[1] > max_x:
            max_x_state = initial_state
            max_x = extremes[1]
        if extremes[2] < min_y:
            min_y_state = initial_state
            min_y = extremes[2]
        if extremes[3] > max_y:
            max_y_state = initial_state
            max_y = extremes[3]

        print("expir:", experiment, "gliders", gliders)

        # print(''.join(
        #     f"x{cell[0]}y{cell[1]}" for cell in game.get_alive_cells()))
        # if alive_count >= threshold:
        #     print(f"Experiment {experiment + 1} success:")
        #     print(''.join(
        #         f"x{cell[0]}y{cell[1]}" for cell in initial_state))
    print("max gliders: ", max_gliders)
    print(''.join(
        f"x{cell[0]}y{cell[1]}" for cell in max_glider_state))

    print("min x: ", min_x)
    print(''.join(
        f"x{cell[0]}y{cell[1]}" for cell in min_x_state))

    print("max x: ", max_x)
    print(''.join(
        f"x{cell[0]}y{cell[1]}" for cell in max_x_state))

    print("min y: ", min_y)
    print(''.join(
        f"x{cell[0]}y{cell[1]}" for cell in min_y_state))

    print("max y: ", max_y)
    print(''.join(
        f"x{cell[0]}y{cell[1]}" for cell in max_y_state))


if __name__ == "__main__":
    find_interesting_patterns()
