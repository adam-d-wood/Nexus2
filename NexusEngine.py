import copy
import random
import math
import pygame
from pygame.locals import *

RED = (255, 0, 0)
BLUE = (0, 0, 255)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)

class Window():
    
    def __init__(self, n):
        self.side_length = 800
        self.n = n

    def setup_display(self):
        self.display = pygame.display.set_mode((self.side_length,self.side_length))
    
    def draw_cross(self, i, j, colour):
        cell_width = self.side_length/self.n
        cross_size = 0.5 * cell_width
        x = j * cell_width
        y = i * cell_width
        cell_centre = [x + cell_width * 0.5, y + cell_width * 0.5]
        top_left = [cell_centre[0] - cross_size*0.5, cell_centre[1] - cross_size*0.5]
        top_right = [cell_centre[0] + cross_size * 0.5, cell_centre[1] - cross_size*0.5]
        bottom_left = [cell_centre[0] - cross_size*0.5, cell_centre[1] + cross_size*0.5]
        bottom_right = [cell_centre[0] + cross_size*0.5, cell_centre[1] + cross_size*0.5]
        pygame.draw.line(self.display, colour, top_left, bottom_right, 3)
        pygame.draw.line(self.display, colour, top_right, bottom_left, 3)

    def draw_naught(self, i, j, colour):
        cell_width = self.side_length/self.n
        naught_size = 0.5 * cell_width
        x = j * cell_width
        y = i * cell_width
        cell_centre = [int(n) for n in [x + cell_width * 0.5, y + cell_width * 0.5]]
        pygame.draw.circle(self.display, colour, cell_centre, int(naught_size*0.5), 1)

    def draw_rook(self, i, j, colour):
        filename = "rook_RED.png" if colour == RED else "rook_BLUE.png"
        rook_image = pygame.image.load("images/" + filename)
        cell_width = self.side_length/self.n
        sf = 0.7
        resized_rook = pygame.transform.scale(rook_image, (int(cell_width*sf), int(cell_width*sf)))
        x = int((j + (1-sf)/2) * cell_width) 
        y = int((i + (1-sf)/2) * cell_width)
        self.display.blit(resized_rook, (x, y))

    def draw_druid(self, i, j, colour):
        filename = "druid_RED.png" if colour == RED else "druid_BLUE.png"
        druid_image = pygame.image.load("images/" + filename)
        cell_width = self.side_length/self.n
        sf = 0.7
        resized_druid = pygame.transform.scale(druid_image, (int(cell_width*sf), int(cell_width*sf)))
        x = int((j + (1-sf)/2) * cell_width) 
        y = int((i + (1-sf)/2) * cell_width)
        self.display.blit(resized_druid, (x, y))

    def draw_ram(self, i, j, colour):
        filename = "ram_RED.png" if colour == RED else "ram_BLUE.png"
        ram_image = pygame.image.load("images/" + filename)
        cell_width = self.side_length/self.n
        sf = 0.85
        resized_ram = pygame.transform.scale(ram_image, (int(cell_width*sf), int(cell_width*sf)))
        x = int((j + (1-sf)/2) * cell_width) 
        y = int((i + (1-sf)/2) * cell_width)
        self.display.blit(resized_ram, (x, y))

    def draw_bishop(self, i, j, colour):
        filename = "bishop_RED.jpg" if colour == RED else "bishop_BLUE.jpg"
        bishop_image = pygame.image.load("images/" + filename)
        cell_width = self.side_length/self.n
        sf = 0.7
        resized_bishop = pygame.transform.scale(bishop_image, (int(cell_width*sf), int(cell_width*sf)))
        x = int((j + (1-sf)/2) * cell_width) 
        y = int((i + (1-sf)/2) * cell_width)
        self.display.blit(resized_bishop, (x, y))

    def draw_crystal(self, i, j, colour):
        filename = "crystal_RED.png" if colour == RED else "crystal_BLUE.png"
        crystal_image = pygame.image.load("images/" + filename)
        cell_width = self.side_length/self.n
        sf = 0.7
        resized_crystal = pygame.transform.scale(crystal_image, (int(cell_width*sf), int(cell_width*sf)))
        x = int((j + (1-sf)/2) * cell_width) 
        y = int((i + (1-sf)/2) * cell_width)
        self.display.blit(resized_crystal, (x, y))

    def draw_nexus(self, i, j, colour):
        filename = "nexus_RED.png" if colour == RED else "nexus_BLUE.png"
        nexus_image = pygame.image.load("images/" + filename)
        cell_width = self.side_length/self.n
        sf = 0.7
        resized_nexus = pygame.transform.scale(nexus_image, (int(cell_width*sf), int(cell_width*sf)))
        x = int((j + (1-sf)/2) * cell_width) 
        y = int((i + (1-sf)/2) * cell_width)
        self.display.blit(resized_nexus, (x, y))


    # def draw_nexus(self, i, j, colour):
    #     cell_width = self.side_length/self.n
    #     naught_size = 0.5 * cell_width
    #     x = j * cell_width
    #     y = i * cell_width
    #     cell_centre = [int(n) for n in [x + cell_width * 0.5, y + cell_width * 0.5]]
    #     pygame.draw.circle(self.display, colour, cell_centre, int(naught_size*0.5), 0)


    def draw_board(self, board):
        n = len(board.field)
        self.display.fill(WHITE)
        for i in range(self.n):
            y = int(self.side_length/n) * (i+1)
            x = int(self.side_length/n) * (i+1)
            horizontal_start = [0, y]
            vertical_start = [x, 0]
            horizontal_end = [self.side_length, y]
            vertical_end = [x, self.side_length]
            pygame.draw.line(self.display, BLACK, horizontal_start, horizontal_end)
            pygame.draw.line(self.display, BLACK, vertical_start, vertical_end)
        
        for i in range(len(board.field)):
            for j in range(len(board.field[0])):
                if board.field[i][j] > 0:
                    colour = RED
                else:
                    colour = BLUE
                if abs(board.field[i][j]) == 1:
                    self.draw_crystal(i, j, colour)
                elif abs(board.field[i][j]) == 2:
                    self.draw_druid(i, j, colour)
                elif abs(board.field[i][j]) == 3:
                    self.draw_ram(i, j, colour)
                elif abs(board.field[i][j]) == 9:
                    self.draw_nexus(i, j, colour)

    def coords_to_square(self, coords):
        cell_width = self.side_length/self.n
        i = int(coords[1] // cell_width)
        j = int(coords[0] // cell_width)
        return [i, j] 

class Board():

    def __init__(self, width, height):
        # self.field = [
        #     [0, 0, 0, -9, 0],
        #     [0, 0, 0, 0, 0],
        #     [0, 0, 0, 0, 0],
        #     [0, 0, 0, 0, 0],
        #     [0, 9, 0, 0, 0],
        # ]
        self.field = [[0 for j in range(width)] for i in range(height)]
        self.field[0][width-2] = -9
        self.field[height-1][1] = 9
        # self.field[0][width-3] = -1
        # self.field = [
        #     [0, -2, -1, -9, 0],
        #     [1, 0, -2, -1, 0],
        #     [0, 0, 0, -2, 0],
        #     [0, 1, 2, 0, 0],
        #     [0, 9, 1, 2, 0]]

class Nexus():

    def __init__(self, width, height):
        self.running = True
        self.turn = 1
        self.board = Board(width , height)
        self.agent = Agent(width, height)
        self.window = Window(width)
        self.control_thresholds = [1, 2, 4]

    def on_board(self, i, j):
        height = len(self.board.field)
        width = len(self.board.field[0])
        return i in range(0, height) and j in range(0, width)

    def gen_d_pattern(self, i, j):
        squares = []
        directions = [
            [0, 1], [1, 0], [0, -1], [-1, 0]
        ]
        for direction in directions:
            square = [i + direction[0], j + direction[1]]
            if self.on_board(square[0], square[1]):
                squares.append(square)
        return squares
    
    def gen_rook_pattern(self, i, j):
        squares = []
        n = max(len(self.board.field), len(self.board.field[0]))
        for k in range(-n, n):
            square1 = [i+k, j]
            square2 = [i, j+k]
            for square in [square1, square2]:
                if self.on_board(square[0], square[1]) and square not in squares:
                    if square != [i, j]:
                        squares.append(square)
        return squares

    def gen_diagonal(self, i, j):
        # print("diagonal on", i, j)
        squares = []
        n = max(len(self.board.field), len(self.board.field[0]))
        for k in range(-n, n):
            square1 = [i + k, j + k]
            square2 = [i - k, j + k]
            for square in [square1, square2]:
                if self.on_board(square[0], square[1]) and square not in squares:
                    if square != [i, j]:
                        squares.append(square)
        # print(squares)
        return squares

    def eliminate_pieces(self, field):
        elimination = False
        new_field = copy.deepcopy(field)
        control_matrix = self.get_control_matrix(field)
        for i in range(len(field)):
            for j in range(len(field)):
                token = field[i][j]
                if token not in [0, 9, -9]:
                    control = control_matrix[i][j]
                    control_needed = self.token_to_control(token)
                    if abs(control) < abs(control_needed):
                        new_field[i][j] = 0
                        elimination = True
        return new_field, elimination

    def get_control_matrix(self, field):
        height = len(field)
        width = len(field[0])
        control_matrix = [[0 for j in range(width)] for i in range(height)]
        for i in range(height):
            for j in range(width):
                token = field[i][j]
                if abs(token) in [1, 9]:
                    affected_cells = self.gen_d_pattern(i, j)
                    for cell in affected_cells:
                        control_matrix[cell[0]][cell[1]] += int(token/abs(token))
                elif abs(token) == 2:
                    affected_cells = self.gen_diagonal(i, j)
                    for cell in affected_cells:
                        control_matrix[cell[0]][cell[1]] += int(token/abs(token))
                elif abs(token) == 3:
                    affected_cells = self.gen_rook_pattern(i, j)
                    for cell in affected_cells:
                        control_matrix[cell[0]][cell[1]] += int(token/abs(token))
        return control_matrix

    def get_cell_control(self, field, cell):
        control_matrix = self.get_control_matrix(field)
        return control_matrix[cell[0]][cell[1]]

    def control_to_token(self, control):
        threshold_reached = None
        for t in self.control_thresholds:
            if abs(control) >= t:
                threshold_reached = t
            else:
                break
        abs_token = self.control_thresholds.index(threshold_reached) + 1
        token = abs_token if control > 0 else -abs_token
        # print(token)
        return token

    def token_to_control(self, token):
        abs_control = self.control_thresholds[abs(token)-1]
        return abs_control if token > 0 else -abs_control

    def get_next_board(self, field, move, turn):
        control = self.get_cell_control(field, move)
        token = self.control_to_token(control)
        i, j = move
        new_field = copy.deepcopy(field)
        n = len(field)
        if i in range(0, n) and j in range(0, n):
            if field[i][j] == 0:
                new_field[i][j] = token
            else:
                raise ValueError("Square Already Occupied")
        else:
            raise ValueError("Invalid coordinates")
        post_elim_field, elimination = self.eliminate_pieces(new_field)
        return post_elim_field, elimination

    def insert_token(self, move):
        new_field, _ = self.get_next_board(self.board.field, move, self.turn)
        self.board.field = new_field

    def get_legal_moves(self, field, turn):
        control_matrix = self.get_control_matrix(field)
        legal_moves = []
        for i in range(len(control_matrix)):
            for j in range(len(control_matrix[i])):
                if control_matrix[i][j] * turn > 0 and field[i][j] == 0:
                    legal_moves.append([i, j])
        return legal_moves

    def get_nexus_coords(self, field):
        for i in range(len(field)):
            for j in range(len(field[i])):
                if field[i][j] == 9:
                    positive_coords = [i, j]
                elif field[i][j] == -9:
                    negative_coords = [i, j]
        return negative_coords, positive_coords

    def game_ended(self, field):
        neg_nexus, pos_nexus = self.get_nexus_coords(field)
        neg_nexus_control = self.get_cell_control(field, neg_nexus)
        pos_nexus_control = self.get_cell_control(field, pos_nexus)
        legal_moves = self.get_legal_moves(field, 1) + self.get_legal_moves(field, -1)
        return (neg_nexus_control  >= 1 or pos_nexus_control <= -1 or len(legal_moves) == 0)
    
    def find_winner(self, field):
        neg_nexus, pos_nexus = self.get_nexus_coords(field)
        neg_nexus_control = self.get_cell_control(field, neg_nexus)
        pos_nexus_control = self.get_cell_control(field, pos_nexus)
        if neg_nexus_control >= 1:
            return 1
        elif pos_nexus_control <= -1:
            return -1
        else:
            return 0

    def get_user_move(self, field, turn):
        legal_moves = self.get_legal_moves(field, turn)
        while True:
            event = pygame.event.wait()
            if event.type == pygame.MOUSEBUTTONDOWN:
                coords = event.pos
                move = self.window.coords_to_square(coords)
                if move in legal_moves:
                    return move

    def insert_in_order(self, x, xs):
        if len(xs) == 0:
            return [x]
        elif len(xs) == 1:
            if x[1] > xs[0][1]:
                return [x] + xs
            else:
                return xs + [x]
        else:
            half = len(xs)//2
            if x[1] > xs[half][1]:
                return self.insert_in_order(x, xs[:half]) + xs[half:]
            else:
                return xs[:half] + self.insert_in_order(x, xs[half:])

    
    def order_by_elims(self, field, turn, legals):
        if len(legals) == 0:
            return []
        elims = []
        non_elims = []
        for move in legals:
            _, elimination = self.get_next_board(field, move, turn)
            if elimination:
                elim_value = abs(field[move[0]][move[1]])
                elims = self.insert_in_order([move, elim_value], elims)
            else:
                non_elims.append(move)
        return [x[0] for x in elims] + non_elims


    def handle_turn(self):
        control_matrix = self.get_control_matrix(self.board.field)
        print(self.turn)
        for i in range(len(self.board.field)):
            print_row = [str(self.board.field[i][j]).zfill(2) for j in range(len(self.board.field[i]))]
            control_print = [str(control_matrix[i][j]).zfill(2) for j in range(len(control_matrix[i]))]
            print(print_row, control_print)
        print()
        if self.game_ended(self.board.field):
            winner = self.find_winner(self.board.field)
            print("winner is: ", winner)
        else:
            if len(self.get_legal_moves(self.board.field, self.turn)) == 0:
                print("pass")
            else:
                # move = self.agent.get_random_move(self.board.field, self.turn)
                if self.turn == 1:
                    # move = self.agent.get_MCTS_move(self.board.field, self.turn)
                    result = self.agent.negamax(Game_Node("hiya", self.board.field, self.turn), 12, -10000, 10000, 1)
                    move = result.move
                    print()
                    print(result.move, result.value)
                    print()
                    # move = self.get_user_move(self.board.field, self.turn)
                else:
                    # move_input = input("move: ").split(" ")
                    # move = [int(x) for x in move_input]
                    # move = self.get_user_move(self.board.field, self.turn)
                    result = self.agent.negamax(Game_Node("bonjour", self.board.field, self.turn), 12, -10000, 10000, -1)
                    # move = self.get_user_move(self.board.field, self.turn)
                    move = result.move
                    print()
                    print(result.move, result.value)
                    print()
                self.insert_token(move)
            self.turn = self.turn * -1
            self.window.draw_board(self.board)
            # self.window.clock.tick(60)
            pygame.display.flip()
            # pygame.time.delay(1)
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    quit()
            self.handle_turn()


class Game_Node():
    
    def __init__(self, move, field, turn, value = 0):
        self.move = move
        self.field = field
        self.turn = turn
        self.children = []
        self.visits = 0
        self.value = value

    def __eq__(self, x):
        return self.move == x.move and self.field == x.field
    
    def __repr__(self):
        move = str(self.move)
        return move + " value: " + str(self.value)

    def __gt__(self, x):
        return self.value > x.value
    
class Agent(Nexus):

    def __init__(self, width, height):
        self.running = True
        self.turn = 1
        self.board = Board(width, height)
        self.control_thresholds = [1, 2, 3]

    def get_random_move(self, field, turn):
        legals = self.get_legal_moves(field, turn)
        move = random.choice(legals)
        return move
    
    def get_next_node_index(self, node, max_token):
        colour = node.turn * max_token
        best_value = -10000 * colour
        best_child_index = 0
        for i in range(len(node.children)):
            child = node.children[i]
            if child.visits == 0:
                uctb = math.inf * colour
            else:
                exploit = child.value / child.visits
                explore = math.sqrt(math.log(node.visits)/child.visits) * colour 
                uctb = exploit + math.sqrt(2) * explore
            if uctb * colour > best_value * colour:
                best_value = uctb
                best_child_index = i
        return best_child_index

    def rollout(self, node, max_token):
        # print("performing rollout:")
        # for row in node.field:
        #     print(row)
        field = copy.deepcopy(node.field)
        turn = node.turn
        while not self.game_ended(field):
            if self.get_legal_moves(field, turn):
                move = self.get_random_move(field, turn)
                field, _ = self.get_next_board(field, move, turn)
            turn = turn * -1
        winner = self.find_winner(field)
        if winner == 0:
            result = 0.5
        elif winner == max_token:
            result = 1
        else:
            result = 0
        # print("result:", result)
        # print()
        return result

    def MCTS(self, node, max_token):
        if not node.children:
            if node.visits == 0:
                result = self.rollout(node, max_token)
                node.visits += 1
                node.value += result
                return result, node
            else:
                node.children = self.expand(node)
                if node.children:
                    result, child = self.MCTS(node.children[0], max_token)
                    node.children[0] = child
                    node.visits += 1
                    node.value += result
                    return result, node
                else:
                    winner = self.find_winner(node.field)
                    if winner == 0:
                        result = 0.5
                    elif winner == max_token:
                        result = 1
                    else:
                        result = 0
                    node.visits += 1
                    node.value += result
                    return result, node
        else:
            next_node_index = self.get_next_node_index(node, max_token)
            result, child = self.MCTS(node.children[next_node_index], max_token)
            node.children[next_node_index] = child
            node.visits += 1
            node.value += result
            return result, node

    def expand(self, node):
        if self.game_ended(node.field):
            return []
        else:
            legals = self.get_legal_moves(node.field, node.turn)
            children = []
            for move in legals:
                child_field, _ = self.get_next_board(node.field, move, node.turn)
                child_node = Game_Node(move, child_field, node.turn * -1)
                children.append(child_node)
            return children

    def get_MCTS_move(self, field, turn):
        tree = Game_Node(None, field, turn)
        for i in range(10):
            result, tree = self.MCTS(tree, turn)
        print(result)
        best_node = None
        best_value = -10000
        print("children:")
        for child in tree.children:
            print(child)
        for child in tree.children: 
            if child.visits == 0:
                fitness = -1000000
            else:
                fitness = child.value/child.visits
            # print("fitness", fitness)
            if fitness >= best_value:
                best_value = fitness
                best_node = child
        print()
        return best_node.move
    
    def evaluate(self, node):
        if self.game_ended(node.field):
            winner = self.find_winner(node.field)
            return winner * 20000
        pos_moves = self.get_legal_moves(node.field, 1)
        neg_moves = self.get_legal_moves(node.field, -1)
        mobility = len(pos_moves) - len(neg_moves)
        neg_nexus, pos_nexus = self.get_nexus_coords(node.field)
        neg_nexus_control = self.get_cell_control(node.field, neg_nexus)
        pos_nexus_control = self.get_cell_control(node.field, pos_nexus)
        nexus_difference = pos_nexus_control + neg_nexus_control
        return nexus_difference*10 + mobility
    
    def negamax(self, node, depth, alpha, beta, colour):
        if depth == 0 or self.game_ended(node.field):
            return Game_Node(None, None, None, colour * self.evaluate(node))
        value = Game_Node("hello", None, None, -10000000)
        legals = self.get_legal_moves(node.field, node.turn)
        # print("legals:", legals)
        if len(legals) == 0:
            child_node = Game_Node(None, node.field, node.turn * -1)
            child_node.value = -self.negamax(child_node, depth -1, -beta, -alpha, -colour).value
            value = max(value, child_node)
            # print("value:", value)
        ordered_legals = self.order_by_elims(node.field, node.turn, legals)
        # print("ordered_legals", ordered_legals)
        for move in ordered_legals:
            child_field, _ = self.get_next_board(node.field, move, node.turn)
            child_node = Game_Node(move, child_field, node.turn*-1)
            child_node.value = -self.negamax(child_node, depth -1, -beta, -alpha, -colour).value
            # print(move, child_node.value)
            value = max(value, child_node)
            # print("value:", value)
            alpha = max(value.value, alpha)
            if alpha >= beta:
                break
        return value
            


nexus = Nexus(5, 5)
nexus.window.setup_display()
nexus.window.draw_board(nexus.board)
pygame.display.flip()
nexus.handle_turn()
a = input()


        

