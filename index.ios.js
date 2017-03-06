import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableNativeFeedback,
  Animated,
  Button,
  ScrollView
} from 'react-native';

class Cell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: this.props.count,
      pressSpring: new Animated.Value(1),
      id: `cell (${this.props.col}, ${this.props.row})`,
      x: this.props.col,
      y: this.props.row,
      isPoop: false,
      isFlag: false,
      isHidden: true
    };
  }
  onPress() {
    if (this.props.getStatus() != 'loser') {
      this.state.pressSpring.setValue(1.2);
      Animated.spring(this.state.pressSpring, { toValue: 1 } ).start();
      if (this.state.isHidden && !this.state.isFlag)
        this.props.revealCells(this.state.x, this.state.y);
    }
  }
  onLongPress() {
    if (this.state.isHidden)
      this.setState({ isFlag: !this.state.isFlag});
    this.state.pressSpring.setValue(1.1);
    Animated.spring(this.state.pressSpring, { toValue: 1 } ).start();
  }
  render() {
    let display = '';
    if (this.state.isHidden) display = this.state.isFlag ? '⚑' : '';
    else display = this.state.isPoop ? '\uD83D\uDCA9' : (this.state.count || '');
    return (
      <TouchableNativeFeedback
        onPress={this.onPress.bind(this)}
        onLongPress={this.onLongPress.bind(this)} >
        <Animated.View style={[styles.cell, {
          backgroundColor: this.state.isHidden ? 'steelblue' : 'lightsteelblue',
          transform: [{scale: this.state.pressSpring}]
        }]} >
          <Text style={styles.icon}>{display}</Text>
        </Animated.View>
      </TouchableNativeFeedback>
    );
  }
}

Cell.propTypes = {
  revealCells: React.PropTypes.func.isRequired
};

class Row extends Component {
  constructor(props) {
    super(props);
    this.cells = [];
    for (let i = 0; i < this.props.size; i++)
      this.cells.push(<Cell
        key={i}
        ref={'cell-'+i}
        row={this.props.row}
        col={i}
        revealCells={this.props.revealCells}
        getStatus={this.props.getStatus} />);
  }
  setColState(col, state, callback) {
    this.refs[`cell-${col}`].setState(state, callback);
  }
  getColState(col) {
    return this.refs[`cell-${col}`].state;
  }
  getHiddenTotal() {
    let sum = 0;
    for (let i = 0; i < this.props.size; i++)
      sum += this.getColState(i).isHidden | 0;
    return sum;
  }
  render() {
    return (
      <View style={styles.row} >
        {this.cells}
      </View>
    );
  }
}

Row.propTypes = {
  revealCells: React.PropTypes.func.isRequired
};

class Table extends Component {
  constructor(props) {
    super(props);
    this.rows = [];
    this.poops = []; // local poop cache
    for (let i = 0; i < this.props.size; i++)
      this.rows.push(<Row
        key={i}
        ref={'row-'+i}
        size={this.props.size}
        row={i}
        revealCells={this.revealCells.bind(this)}
        getStatus={this.props.getStatus} />);
  }
  revealCells(x, y) {
    let loop = (x, y) => {
      let cell = this.getCellState(x, y);
      let borderCells = [
        this.getCellState(x-1, y-1),
        this.getCellState(x, y-1),
        this.getCellState(x+1, y-1),
        this.getCellState(x-1, y),
        this.getCellState(x+1, y),
        this.getCellState(x-1, y+1),
        this.getCellState(x, y+1),
        this.getCellState(x+1, y+1)
      ].filter(c => c !== null && !this.renderQueue.filter(p => p.x == c.x && p.y == c.y).length);

      if (!cell.isFlag && cell.isHidden) {
        this.renderQueue.push({x, y});
        if (cell.isPoop) {
          this.renderQueue = [{x, y}];
          this.props.setStatus('loser');
          return;
        }
        if (!cell.count)
          borderCells.forEach(c => loop(c.x, c.y));
      }

    };
    this.renderQueue = [];
    this.props.setStatus('nervous');
    setTimeout(() => {
      loop(x, y);
      this.renderQueue.forEach(p => this.setCellState(p.x, p.y, { isHidden: false }, () => {
          if (this.props.getStatus() != 'loser') {
            let hiddenTotal = this.getHiddenTotal();
            if (hiddenTotal == this.props.totalPoops) {
              this.revealAll();
              setTimeout(() => this.props.setStatus('winner'), 250);
            } else setTimeout(() => this.props.setStatus('player'), 200);
          }
      }));
    }, 0);
  }
  setupPoops(total) {
    if (total) {
      let sizeSq = this.props.size * this.props.size;
      let index =  (Math.random() * sizeSq) | 0;
      let row = index / this.props.size | 0;
      let col = index % this.props.size;
      let cell = this.getCellState(col, row);
      if (!cell.isPoop) {
        this.setCellState(col, row, { isPoop: true });
        this.poops.push({ x: col, y: row });
        console.log("poop @ " + col + ", " + row);
        this.setupPoops(total - 1);
      } else this.setupPoops(total);
    }
  }
  setupClues() {
    for (let i = 0; i < this.props.size; i++) {
      for (let j = 0; j < this.props.size; j++) {
        let count = this.getBorderPoop(j, i).length;
        this.setCellState(j, i, { count });
      }
    }
  }
  getBorderPoop(x, y) {
    let ups = {
      upleft: this.poops.filter(p => p.x == x-1 && p.y == y-1),
      up: this.poops.filter(p => p.x == x && p.y == y-1),
      upright: this.poops.filter(p => p.x == x+1 && p.y == y-1)
    };
    let downs = {
      downleft: this.poops.filter(p => p.x == x-1 && p.y == y+1),
      down: this.poops.filter(p => p.x == x && p.y == y+1),
      downright: this.poops.filter(p => p.x == x+1 && p.y == y+1)
    };
    let sides = {
      left: this.poops.filter(p => p.x == x-1 && p.y == y),
      right: this.poops.filter(p => p.x == x+1 && p.y == y)
    };
    let states = [
      ups.upleft,
      ups.up,
      ups.upright,
      sides.left, sides.right,
      downs.downleft,
      downs.down,
      downs.downright
    ]
      .filter(cell => !!cell.length)
      .map(cell => cell[0]);
    return states;
  }
  componentDidMount() {
    this.setupPoops(this.props.totalPoops);
    this.setupClues();
  }
  setCellState(x, y, state, callback) {
    this.refs[`row-${y}`].setColState(x, state, callback);
  }
  getCellState(x, y) {
    if ((x < 0 || x >= this.props.size || y < 0 || y >= this.props.size) || isNaN(x) || isNaN(y))
      return null;
    return this.refs[`row-${y}`].getColState(x);
  }
  getHiddenTotalByRow(row) {
    return this.refs[`row-${row}`].getHiddenTotal();
  }
  getHiddenTotal() {
    let sum = 0;
    for (let i = 0; i < this.props.size; i++)
      sum += this.refs[`row-${i}`].getHiddenTotal();
    return sum;
  }
  revealAll() {
    for (let i = 0; i < this.props.size; i++)
      for (let j = 0; j < this.props.size; j++)
        this.setCellState(j, i, { isHidden: false, isFlag: false });
  }
  render() {
    return <View style={styles.table}>{this.rows}</View>;
  }
};

export default class Poopsweeper extends Component {
  constructor() {
    super();
    this.state = {
      key: -1,
      status: 'player'
    };
    this.statusEnum = {
      player: '\uD83D\uDE42',
      winner: '😁',
      nervous: '😓',
      loser: '😭'
    };
  }
  setStatus(status) {
    this.setState({status});
  }
  getStatus() {
    return this.state.status;
  }
  getStatusEmoji() {
    return this.statusEnum[this.state.status];
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.instructions}>
          <Text style={styles.title}>Poopsweeper</Text>
          <Text style={styles.text}>Press on a cell to reveal it and long press to flag it.</Text>
        </View>
        <ScrollView>
          <Table
            key={this.state.key}
            size={9}
            totalPoops={9}
            setStatus={this.setStatus.bind(this)}
            getStatus={this.getStatus.bind(this)} />
        </ScrollView>
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>{this.getStatusEmoji()}</Text>
        </View>
        <Button color='#999' style={styles.reset} onPress={() => this.setState({key: Math.random() * 10, status: 'player'})} title='New Game'/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#eee'
  },
  icon: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center'
  },
  title: {
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 24
  },
  text: {
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#bbb',
    fontSize: 14
  },
  instructions: {
    flex: .2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusText: {
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#bbb',
    fontSize: 36
  },
  statusBar: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#ddd'
  },
  table: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cell: {
    width: 36,
    height: 36,
    margin: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee'
  },
  reset: {
    backgroundColor: 'green',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

AppRegistry.registerComponent('poopsweeper', () => Poopsweeper);
