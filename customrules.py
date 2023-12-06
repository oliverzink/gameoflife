import random
import time


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
        value_of_cells = {}

        for x, y in self.alive_cells:
            cells_to_check.add((x, y))
            for dx in (-1, 0, 1, 2, -2):
                for dy in (-1, 0, 1, 2, -2):
                    nx, ny = x + dx, y + dy
                    if (nx, ny) not in value_of_cells:
                        value_of_cells[(nx, ny)] = 0
                    cells_to_check.add((nx, ny))

        for x, y in cells_to_check:
            for dx in (-1, 0, 1, 2, -2):
                for dy in (-1, 0, 1, 2, -2):
                    if dx != 0 or dy != 0:
                        nx, ny = x + dx, y + dy
                        if (nx, ny) in self.alive_cells:
                            if abs(dx) + abs(dy) == 1:
                                value_of_cells[(nx, ny)] += 4
                            elif abs(dx) + abs(dy) == 2:
                                value_of_cells[(nx, ny)] += 3
                            elif abs(dx) + abs(dy) == 3:
                                value_of_cells[(nx, ny)] += 2
                            elif abs(dx) + abs(dy) == 4:
                                value_of_cells[(nx, ny)] += 1

        for x, y in cells_to_check:
            value = value_of_cells[(x, y)]
            if (x, y) in self.alive_cells:
                if 4 <= value:
                    new_alive_cells.append((x, y))
            else:
                if 5 <= value:
                    new_alive_cells.append((x, y))

        self.alive_cells = new_alive_cells

    # def generate_glider(self, top_left_x, top_left_y):
    #     glider_pattern = [(0, 1), (1, 2), (2, 0), (2, 1), (2, 2)]
    #     self.alive_cells = [(top_left_x + dx, top_left_y + dy)
    #                         for dx, dy in glider_pattern]

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


def find_interesting_patterns():
    width, height = 25, 25

    steps = 300  # the amount of generations for each game
    # success_condition = 1.5  # percentage of cells alive in order to save state

    # the percentage of cells that are on in the initial grid
    percentage_min, percentage_max = 10, 60
    max_state, max_count = [], 0
    # max_glider_state, max_gliders = [], 0

    # interesting_arr = []
    min_x, min_x_state = 0, []
    min_y, min_y_state = 0, []
    max_x, max_x_state = 0, []
    max_y, max_y_state = 0, []

    for experiment in range(300):
        game = GameOfLife()

        percentage = random.randint(percentage_min, percentage_max) / 100
        initial_cells_alive = int(percentage * width * height)
        # threshold = int(success_condition*initial_cells_alive)

        initial_state = game.generate_random_state(
            width, height, initial_cells_alive)

        game.set_initial_state(initial_state)
        # game.generate_glider(0, 0)
        # game.alive_cells = [(0, 0), (1, 0), (2, 0), (2, 1), (1, 2)]

        for _ in range(steps):
            game.next_generation()

        alive_count = game.count_alive_cells()
        # gliders = game.count_gliders()
        if alive_count > max_count:
            max_state = initial_state
        extremes = game.get_extremes()
        # if gliders > max_gliders:
        #     max_glider_state = initial_state
        #     max_gliders = gliders

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

        print("expir:", experiment)

        # print(''.join(
        #     f"x{cell[0]}y{cell[1]}" for cell in game.get_alive_cells()))
        # if alive_count >= threshold:
        #     print(f"Experiment {experiment + 1} success:")
        #     print(''.join(
        #         f"x{cell[0]}y{cell[1]}" for cell in initial_state))
    # print("max gliders: ", max_gliders)
    # print(''.join(
    #     f"x{cell[0]}y{cell[1]}" for cell in max_glider_state))
    print("max count: ", max_count)
    print(''.join(
        f"x{cell[0]}y{cell[1]}" for cell in max_state))

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
