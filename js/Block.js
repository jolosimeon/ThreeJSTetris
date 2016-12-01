function Block(x, y, z, cube) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.cube = cube;
  this.isOccupied = false;

  this.getX = function() {
    return this.x;
  }

  this.setX = function(x) {
    this.x = x;
  }

  this.getY = function() {
    return this.y;
  }

  this.setY = function(y) {
    this.y = y;
  }

  this.getZ = function() {
    return this.z;
  }

  this.setZ = function(z) {
    this.z = z;
  }

  this.getCube = function() {
    return this.cube;
  }

  this.setY = function(cube) {
    this.cube = cube;
  }

  this.getOccupied = function() {
    return this.cube;
  }

  this.setOccupied = function(isOccupied) {
    this.isOccupied = isOccupied;
  }
}
