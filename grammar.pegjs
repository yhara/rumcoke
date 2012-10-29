start
  = expr

expr
  = literal

literal
  = integer
  / string
  / vector

integer
  = digits:[0-9]+
  { return ["integer", parseInt(digits.join(""), 10)]; }

string
  = '"' content:[^"]* '"'
  { return ["string", content.join("")]; }

vector
  = "#(" content:(expr space)* ")"
  { return ["vector", content]; }

space
  = " "+
