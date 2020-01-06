import java.util.*;
import java.io.PrintStream;
class Expr {
    enum kind {EQ, NE, LT, LE, GT, GE, ADD, SUB, STAR, DIV, NOT, UNSUB};
    int line;  
    Type t;
    kind k;
    int Ri;
    int err=0;
    Expr() { }
    Expr(kind k) { this.k = k; }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {}
    void typecheck() {}
    void cgen(PrintStream ps,StringTable strTable) {}
    Type getType() { return t;}

}
class Stmt {
    int line;
    int err=0;
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {}
    void typecheck() {}
    void cgen(PrintStream ps,StringTable strTable) {}
    
}

class reportError {
    String errortype;
    int lineno;
    reportError(int currlineno, String myerror) {
    this.errortype = myerror;
    this.lineno = currlineno;
    System.out.println("Error at line " + currlineno + ": found in " + myerror);
    }
}

class Program {

    LinkedList<exDecl> edl;
    StringTable strTable;
    SymbolTable<String,basicSym> st;
    int err=0;

    Program(LinkedList<exDecl> edl) {
	this.edl = edl;
	strTable = new StringTable();
    }

    void resolve() {
	st = new SymbolTable<String,basicSym>();
	st.enterScope();
	// Iterate over the external declaration list to resolve global symbols
	for (exDecl d: edl) { d.globals(st,strTable);}
	// Iterate over bodies of functions to resolve local symbols
	for (exDecl d: edl) { d.resolve(st,strTable);}
	if(st.lookup("main")==null)
	{
	  System.err.println("Line "+edl.peekLast().line);
	  System.err.println("ERROR: 'main' function not found!");
	  err++;
	}
	st.exitScope();
    }

    void typecheck() {
	for (exDecl d: edl) { d.typecheck(); err+=d.err;}
    }
    void cgen(PrintStream ps) {
      CGSupport.emitPrologue(ps);
      for(String key: strTable.tbl.keySet())
      {
	String val = strTable.tbl.get(key);
	CGSupport.emitString(val+":\t.string\t\""+key+"\"",ps);
	CGSupport.emitString("\t.text",ps);
      }
      CGSupport.emitStringPrologue(ps);
      for(exDecl d: edl) { if(d.cs==null) d.cgen(ps,strTable);} // make other global declarations here
      CGSupport.emitEpilogue(ps);
      for(exDecl d: edl) { if(d.cs!=null) d.cgen(ps,strTable);} // make function declarations after start is done
    }
}

class exDecl {
    idExpr ne;
    Type t;
    Expr ce;
    block cs;
    int line;
    int err=0;

    // constructor for uninitialized variable
    exDecl(int line, idExpr ne, Type t) {
	this.line = line;
	this.ne = ne;
	this.t = t;
	this.ce = null;
	this.cs = null;
    }

    // constructor for initialized variable
    exDecl(int line, idExpr ne, Type t, Expr ce) {
	this.line = line;
	this.ne = ne;
	this.t = t;
	this.ce = ce;
	this.cs = null;
    }

    // constructor for function declaration, param list in (funcType)t
    exDecl(int line, idExpr ne, funcType t, block cs) {
	this.line = line;
	this.ne = ne;
	this.t = t;
	this.ce = null;
	this.cs = cs;
    }

    void globals(SymbolTable<String,basicSym> st, StringTable strTable) {
	if(st.lookup(this.ne.lexeme) != null)
	{
	  System.err.println("Line " + this.line);
	  System.err.println("ERROR: "+this.ne.lexeme+" has already been declared");
	  err++;
	}
	else
	{
	  basicSym atmp;
	  if(this.ce!=null) // this is a variable
	    atmp = new basicSym(basicSym.kind.GLOBAL,this.t);
	  else if(this.cs!=null) // this is a function, this.t is of funcType which holds params
	    atmp = new basicSym(basicSym.kind.FUNCTION,this.t);
	  else // this is an undeclared variable
	    atmp = new basicSym(basicSym.kind.GLOBAL,this.t);
	  atmp.setDepth(st.scopeLevel()-1);
	  st.addId(this.ne.lexeme,atmp);
	  this.ne.symentry = atmp;
	}
    }

    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
	if(err>0)
	  return;
	this.ne.resolve(st,strTable);
	err+=this.ne.err;
	if(ne.lexeme.equals("main"))
	{
	  if(this.cs==null)
	  {
	    err++;
	    System.err.println("Line " + this.line);
	    System.err.println("ERROR: 'main' must be a function");
	  }
	}
	if(this.ce!=null)
	{
	  this.ce.resolve(st,strTable);
	  err+=this.ce.err;
	}
	if(this.cs!=null)
	{
	  // this is where we resolve the parameters held in funcType as well
	  LinkedList<Param> templist = new LinkedList<Param>();
	  templist = ((funcType)this.t).getplist();
	  st.enterScope();  
	  // Iterate over the external declaration list to resolve global symbols
	  int off=0;
	  int cont=1;
	  for (Param p: templist) 
	  { 
	    if(st.lookup(p.ne.lexeme) != null){
	      if(((basicSym)st.lookup(p.ne.lexeme)).k == basicSym.kind.PARAM && ((basicSym)st.lookup(p.ne.lexeme)).mydepth == st.scopeLevel()-1)
	      {
		System.err.println("Line " + this.line);
		System.err.println("ERROR: "+p.ne.lexeme+" has already been declared as a parameter in function "+this.ne.lexeme);
		this.err++;
		cont=0;
	      }}
	    if(cont==1)
	    {
	      off+=4;
	      basicSym atmp = new basicSym(basicSym.kind.PARAM,p.getType(),off); // just remember this offset is reversed
	      atmp.setDepth(st.scopeLevel()-1);
	      st.addId(p.ne.lexeme,atmp);
	      p.ne.symentry=atmp;
	    }
	  }
	  if(off>0 && ne.lexeme.equals("main"))
	  {
	    System.err.println("Line " + this.line);
	    System.err.println("ERROR: 'main' function cannot have any parameters");
	    err++;
	  }
	  this.cs.resolve(st,strTable);
	  err+=this.cs.err;
	  st.exitScope();
	}
    }

    void typecheck() {
       
      if(err>0)
	return;
      err-=this.ne.err;
      this.ne.typecheck();
      err+=this.ne.err;
      this.t = this.ne.t;
      if(this.ne.lexeme.equals("main"))
      {
	if(this.t.k != Type.kind.INT)
	{
	  err++;
	  System.err.println("Line " + this.line); 
	  System.err.println("ERROR: 'main' must be of type INT");
	  return;
	}
      }
      if(this.ce != null)
      {
	err-=this.ce.err;
	this.ce.typecheck();
	err+=this.ce.err;
	if(this.ne.t.k != this.ce.t.k)
	{
	  System.err.println("Line " + this.line);
	  System.err.println("ERROR: Type mismatch, expected expression of type "+this.t.k+", but received type "+this.ce.t.k);
	  err++;
	}
      }
      if(this.cs!=null)
      {
	err-=this.cs.err;
	this.cs.typecheck();
	err+=this.cs.err;
	if(this.t.k != cs.getRetType())
	{
	  System.err.println("Line " + this.line);
	  System.err.println("ERROR: Function '"+this.ne.lexeme+"' return value expected of type "+this.t.k);	      
	  err++;
	}
      }
    }    
    
    void cgen(PrintStream ps,StringTable strTable) {
      if(this.cs==null) // global variable declaration
      {
	if(this.t.k ==Type.kind.STRING)
	  this.ne.symentry.currentOffset = this.ne.lexeme;
	else
	  this.ne.symentry.currentOffset = this.ne.lexeme;
	this.ne.symentry.currentval = -1;
	int initval=0;
	if(this.ce!=null)
	{
	  if(this.t.k==Type.kind.STRING)
	  {  // if it is a string, find from the string table
	    CGSupport.emitString(this.ne.lexeme+":\t.long\t"+strTable.lookup(((constantExpr)this.ce).s),ps);
	  }
	  else if(this.t.k == Type.kind.BOOLEAN || this.t.k == Type.kind.INT || this.t.k == Type.kind.CHAR)
	  {
	  // translate non-string to int initval
	    if(this.ce!=null)
	      initval=((constantExpr)this.ce).i;
	    CGSupport.emitString(this.ne.lexeme+":\t.long\t"+initval,ps);
	  }
	}
      }  
    else // function declaration
    {
      CGSupport.emitString(this.ne.lexeme+":",ps);
      CGSupport.emitString("\tpushl\t%ebp",ps);
      CGSupport.emitString("\tmovl\t%esp, %ebp",ps);
      funcType ft = (funcType)this.t;
      int count=4;
      for(Param p:ft.getplist())
      {
	p.ne.symentry.currentOffset = "(%ebp)";
	count+=4;
	p.ne.symentry.currentval = count;
      }
      this.cs.cgen(ps,strTable);
      CGSupport.emitString("\tleave\n\tret",ps);
    }
  }
}

class boolExpr extends Expr { // LOGICAL OR
    Expr el, er;

    boolExpr( int line, Expr el, Expr er) {
	this.line = line;
	this.el = el;
	this.er = er;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
	//  the purpose of this function is to  ensure that any variables used here are already initialized
	el.resolve(st,strTable);
	err+=this.el.err;
	er.resolve(st,strTable); // i think this should suffice for this bit
	err+=this.er.err;
    }
    void typecheck() {
	if(err>0) return;
	err-=this.el.err;
	el.typecheck();
	err+=this.el.err;
	err-=this.er.err;
	er.typecheck();
	err+=this.er.err;
	if(el.t.k != Type.kind.BOOLEAN || er.t.k != Type.kind.BOOLEAN) 
	{	
	  System.err.println("Line " + this.line);
	  System.err.println("ERROR: Expressions in '||' comparison must be of type BOOLEAN");	  
	  err++;
	}
	this.t = new Type(Type.kind.BOOLEAN);
    }
    void cgen(PrintStream ps, StringTable st) {
      el.cgen(ps,st);
      CGSupport.emitString("\tpushl\t%eax",ps);
      er.cgen(ps,st);
      CGSupport.emitString("\tpopl\t%ecx",ps);
      CGSupport.emitString("\torl\t%ecx, %eax",ps);
    }
}


class joinExpr extends Expr { // LOGICAL AND
    Expr el, er;

    joinExpr( int line, Expr el, Expr er) {
	this.line = line;
	this.el = el;
	this.er = er;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
   	el.resolve(st,strTable);
	err+=el.err;
	er.resolve(st,strTable);
	err+=er.err;
    }
    void typecheck() {
	if(err>0) return;
	err-=this.el.err;
	el.typecheck();
	err+=this.el.err;
	err-=this.er.err;
	er.typecheck();
	err+=this.er.err;
	if(el.t.k != Type.kind.BOOLEAN || er.t.k != Type.kind.BOOLEAN) 
	{
	  System.err.println("Line " + this.line);
	      System.err.println("ERROR: Expressions in '&&' comparison must be of type BOOLEAN");	
	      this.err++;
	}
	this.t = new Type(Type.kind.BOOLEAN);
    }
    void cgen(PrintStream ps, StringTable st) {
      el.cgen(ps,st);
      CGSupport.emitString("\tpushl\t%eax",ps);
      // compare %eax with %ecx: for equal, leave %eax, else, %eax = 0
      er.cgen(ps,st);
      CGSupport.emitString("\tpopl\t%ecx",ps);
      CGSupport.emitString("\tcmpl\t%eax, %ecx",ps);
      CGSupport.emitString("\tandl\t%ecx, %eax",ps);
    }
}

class equExpr extends Expr { // LOGICAL EQ, NE
    Expr el, er;

    equExpr( int line, kind k, Expr el, Expr er) {
	super(k);
	this.line = line;
	this.el = el;
	this.er = er;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
    	el.resolve(st,strTable);
	err+=el.err;
	er.resolve(st,strTable); 
	err+=er.err;
    }
    void typecheck() {
	if(err>0) return;
	err-=this.el.err;
	el.typecheck();
	err+=this.el.err;
	err-=this.er.err;
	er.typecheck();
	err+=this.er.err;
	if(el.t.k == Type.kind.BOOLEAN)
	{
	  if(er.t.k != Type.kind.BOOLEAN)
	  {
	    System.err.println("Line " + this.line); 
	    System.err.println("ERROR: Expected type BOOLEAN in right side of equality expression, received "+er.t.k);
	    this.err++;
	  }	  
	}
	else if(el.t.k == Type.kind.CHAR)
	{
	  if(er.t.k != Type.kind.CHAR)
	  {
	    System.err.println("Line " + this.line); 
	    System.err.println("ERROR: Expected type CHAR in right side of equality expression, received "+er.t.k);
	    this.err++;
	  }  
	}
	else if (el.t.k == Type.kind.INT)
	{
	  if(er.t.k != Type.kind.INT)
	  {
	    System.err.println("Line " + this.line); 
	    System.err.println("ERROR: Expected type INT in right side of equality expression, received "+er.t.k);
	    this.err++;
	  }	  
	}
	else
	{
	    System.err.println("Line " + this.line);
	    System.err.println("ERROR: Left side of expressions in '==' or '!=' comparisons must be of type BOOLEAN, CHAR, or INT");
	    this.err++;
	}
	this.t = new Type(Type.kind.BOOLEAN);
    }
    void cgen(PrintStream ps, StringTable st) {
      el.cgen(ps,st);
      CGSupport.emitString("\tpushl\t%eax",ps);
      er.cgen(ps,st);
      CGSupport.emitString("\tpopl\t%ecx",ps);
      CGSupport.emitString("\tcmpl\t%ecx, %eax",ps); // set compare flags
      if(this.k==Expr.kind.EQ) // equal test
	CGSupport.emitString("\tje\tL"+st.count+"true",ps); // jump if equal
      if(this.k==Expr.kind.NE) // not equal test
	CGSupport.emitString("\tjne\tL"+st.count+"true",ps); // jump if not equal
      CGSupport.emitString("\txorl\t%eax, %eax",ps);
      CGSupport.emitString("\tjmp\tL"+st.count+"done",ps);
      CGSupport.emitString("L"+st.count+"true:\tmovl\t$1, %eax",ps);
      CGSupport.emitString("L"+st.count+"done:",ps);
      st.count++;
    }
}

class relExpr extends Expr {
    Expr el, er;

    relExpr( int line, kind k, Expr el, Expr er) {
	super(k);
	this.line = line;
	this.el = el;
	this.er = er;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      el.resolve(st,strTable);
      err+=el.err;
      er.resolve(st,strTable);
      err+=er.err;
    }
    void typecheck() {
      if(err>0) return;
	err-=this.el.err;
	el.typecheck();
	err+=this.el.err;
	err-=this.er.err;
	er.typecheck();
	err+=this.er.err;
      if (el.t.k == Type.kind.INT)
	{
	  if(er.t.k != Type.kind.INT)
	  {
	    System.err.println("Line " + this.line); 
	    System.err.println("ERROR: Right side of expressions in '<', '>', '<=', or '>=' comparisons must be of type INT, received "+er.t.k);
	    this.err++;
	  }	  
	}
	else
	{
	    System.err.println("Line " + this.line);
	    System.err.println("ERROR: Left side of expressions in '<', '>', '<=', or '>=' comparisons must be of type INT, received "+el.t.k);
	    this.err++;
	}
	this.t = new Type(Type.kind.BOOLEAN);
    }
    void cgen(PrintStream ps, StringTable st) {
      el.cgen(ps,st);
      CGSupport.emitString("\tpushl\t%eax",ps);
      er.cgen(ps,st);
      CGSupport.emitString("\tpopl\t%ecx",ps);
      CGSupport.emitString("\tcmpl\t%eax, %ecx",ps); // set compare flags
      if(this.k==Expr.kind.GE) // GE test
	CGSupport.emitString("\tjge\tL"+st.count+"true",ps); // jump if GE
      if(this.k==Expr.kind.GT) // GT test
	CGSupport.emitString("\tjg\tL"+st.count+"true",ps); // jump if GT
      if(this.k==Expr.kind.LE) // LE test
	CGSupport.emitString("\tjle\tL"+st.count+"true",ps); // jump if LE
      if(this.k==Expr.kind.LT) // LT test
	CGSupport.emitString("\tjl\tL"+st.count+"true",ps); // jump if LT
      CGSupport.emitString("\txorl\t%eax, %eax",ps);
      CGSupport.emitString("\tjmp\tL"+st.count+"done",ps);
      CGSupport.emitString("L"+st.count+"true:\tmovl\t$1, %eax",ps);
      CGSupport.emitString("L"+st.count+"done:",ps);
      st.count++;
    }
}

class addExpr extends Expr {
    Expr el, er;

    addExpr( int line, kind k, Expr el, Expr er) {
	super(k);
	this.line = line;
	this.el = el;
	this.er = er;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      el.resolve(st,strTable);
      err+=el.err;
      er.resolve(st,strTable);
      err+=er.err;
    }
    void typecheck() {
      if(err>0) return;
	err-=this.el.err;
	el.typecheck();
	err+=this.el.err;
	err-=this.er.err;
	er.typecheck();
	err+=this.er.err;
      if (el.t.k == Type.kind.INT)
      {
	if(er.t.k != Type.kind.INT)
	{
	  System.err.println("Line " + this.line); 
	  System.err.println("ERROR: Right side of expressions in addition or subtraction must be of type INT, received "+er.t.k);
	  this.err++;
	}	  
      }
      else
      {
	  System.err.println("Line " + this.line);
	  System.err.println("ERROR: Left side of expressions in addition or subtraction must be of type INT, received "+el.t.k);
	  this.err++;
      }
      this.t = new Type(Type.kind.INT);
    }
    void cgen(PrintStream ps, StringTable st) {
      el.cgen(ps,st);
      CGSupport.emitString("\tpushl\t%eax",ps);
      er.cgen(ps,st);
      CGSupport.emitString("\tpopl\t%ecx",ps);
      if(this.k==Expr.kind.ADD)
	CGSupport.emitString("\taddl\t%ecx, %eax",ps);
      if(this.k==Expr.kind.SUB)
      {
	CGSupport.emitString("\tsubl\t%eax, %ecx",ps);
	CGSupport.emitString("\tmovl\t%ecx, %eax",ps);
      }
    }
}

class mulExpr extends Expr {
    Expr el, er;

    mulExpr( int line, kind k, Expr el, Expr er) {
	super(k);
	this.line = line;
	this.el = el;
	this.er = er;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      el.resolve(st,strTable);
      err+=el.err;
      er.resolve(st,strTable);
      err+=er.err;
    }
    void typecheck() {
      if(err>0) return;
	err-=this.el.err;
	el.typecheck();
	err+=this.el.err;
	err-=this.er.err;
	er.typecheck();
	err+=this.er.err;
      if (el.t.k == Type.kind.INT)
	{
	  if(er.t.k != Type.kind.INT)
	  {
	    System.err.println("Line " + this.line); 
	    System.err.println("ERROR: Right side of expressions in multiplication or division must be of type INT, received "+er.t.k);
	    this.err++;
	  }	  
	}
	else
	{
	    System.err.println("Line " + this.line);
	    System.err.println("ERROR: Left side of expressions in multiplication or division must be of type INT, received "+el.t.k);
	    this.err++;
	}
	this.t = new Type(Type.kind.INT);
    }
    void cgen(PrintStream ps, StringTable st) {
      el.cgen(ps,st);
      CGSupport.emitString("\tpushl\t%eax",ps);
      er.cgen(ps,st);
      if(this.k==Expr.kind.STAR)
      {
	CGSupport.emitString("\tpopl\t%ecx",ps);
	CGSupport.emitString("\timull\t%ecx, %eax",ps);
      }
      else if(this.k==Expr.kind.DIV)
      {
	CGSupport.emitString("\tmovl\t%eax, %ebx",ps);
	CGSupport.emitString("\tpopl\t%eax",ps);
	CGSupport.emitString("\tcltd",ps);
	CGSupport.emitString("\tidivl\t%ebx",ps);
      }
    }
}

class unaryExpr extends Expr {
    Expr e;

    unaryExpr( int line, kind k, Expr e) {
	super(k);
	this.line = line;
	this.e = e;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      e.resolve(st,strTable);
      err+=e.err;
    }
    void typecheck() {
      if(err>0) return;
	err-=this.e.err;
	e.typecheck();
	err+=this.e.err;
      if(this.k == Expr.kind.NOT)
      {
	if(e.t.k != Type.kind.BOOLEAN)
	{
	  System.err.println("Line " + this.line);
	  System.err.println("ERROR: only BOOLEAN may have the NOT (!) operator applied to it");
	  this.err++;
	}
	this.t = new Type(Type.kind.BOOLEAN);
      }
      else if(this.k == Expr.kind.UNSUB)
      {
	if(e.t.k != Type.kind.INT)
	{
	  System.err.println("Line " + this.line);
	  System.err.println("ERROR: only INT may have the negative (-) operator applied to it");
	  this.err++;
	}
	this.t = new Type(Type.kind.INT);
      }
      else
      {
	System.err.println("Line " + this.line);
	System.err.println("ERROR: unknown type of unary expression");
	this.err++;
      }
    }
    void cgen(PrintStream ps, StringTable st) {
      e.cgen(ps,st);
      if(this.k==Expr.kind.NOT)
      {
	CGSupport.emitString("\tnotl\t%eax",ps);
	CGSupport.emitString("\taddl\t$2, %eax",ps);
      }
      if(this.k==Expr.kind.UNSUB)
	CGSupport.emitString("\tnegl\t%eax",ps);
    }
}

class assignExpr extends Expr {
    idExpr ne;
    Expr er;
    int line;

    assignExpr(int line, idExpr ne, Expr er) {
	this.line = line;
	this.ne = ne;
	this.er = er;
    }
  assignExpr(int line, idExpr ne) { // partial declaration
	this.line = line;
	this.ne = ne;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      ne.resolve(st,strTable); 
      err+=ne.err;
      er.resolve(st,strTable);
      err+=er.err;
    }

    void typecheck() {
      if(err>0) return;
	err-=this.ne.err;
	ne.typecheck();
	err+=this.ne.err;
      if(ne.symentry.func==1)
      {
	System.err.println("Line " + this.line);
	System.err.println("ERROR: Cannot assign a value to a FUNCTION name");
	this.err++;
      }
	err-=this.er.err;
	er.typecheck();
	err+=this.er.err;
      this.t = new Type(Type.kind.VOID);
      if(er.t.k == Type.kind.VOID)
      {
	System.err.println("Line " + this.line);
	System.err.println("ERROR: Cannot assign variable of type VOID");  
	this.err++;
      }
      else if (ne.t.k == Type.kind.VOID)
      {
	System.err.println("Line " + this.line);
	System.err.println("ERROR: Cannot assign variable to type VOID");    
	this.err++;
      }
      else if(er.t.k != ne.t.k)
      {
	System.err.println("Line " + this.line);
	System.err.println("ERROR: Type mismatch in assignment: left side is of type "+ne.t.k +", while right side is of type "+er.t.k);
	this.err++;
      }
    }
    void cgen(PrintStream ps, StringTable st) {
      er.cgen(ps,st);
      if(this.ne.symentry.currentval!=-1)
      {
	CGSupport.emitString("\tmovl\t%eax, "+this.ne.symentry.currentval+this.ne.symentry.currentOffset+" #move %eax to "+this.ne.t.k+" "+this.ne.lexeme,ps);
      }
      else
	CGSupport.emitString("\tmovl\t%eax, "+this.ne.symentry.currentOffset+" #move %eax to "+this.ne.t.k+" "+this.ne.lexeme,ps);
    }
}

class callExpr extends Expr {
    idExpr ne;
    LinkedList<Expr> al;
    basicSym symentry;

    callExpr(int line, idExpr ne, LinkedList<Expr> al) {
	this.line = line;
	this.ne = ne;
	this.al = al;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      // make sure that ne is in st at this scope level or above
      ne.resolve(st,strTable);
      err+=ne.err;
      basicSym tmp = st.lookup(this.ne.lexeme);
      if(tmp==null)
      {
	System.err.println("Line " + this.line);
	System.err.println("ERROR: function "+this.ne.lexeme+" is not defined");
	err++;
      }
      else
      {
	for(Expr e: al) { // resolve the expressions
	  e.resolve(st,strTable);
	  err+=e.err;
	}
	// go through all expressions in al, make sure they match in number
	// with the parameters in the funcType of the other function specified in ne
	 Expr a = new Expr(); 
	 if(al.size()>0)
	  a = al.getFirst();
	 else a=null;
	  int iter=0;
	  LinkedList<Param> templist = new LinkedList<Param>();
	  templist = ((funcType)st.lookup(this.ne.lexeme).t).getplist();
	  for (Param p: templist)  // checking size ONLY
	  { 
	    if(a==null)
	    {
	      System.err.println("Line " + this.line);
	      System.err.println("ERROR: Argument number mismatch: too few arguments received in call to function "+this.ne.lexeme);
	      err++;
	      break;
	    }
	    iter++;
	    if(iter==al.size())
	      a=null;
	    else
	      a=al.get(iter);
	  }
	  if(a!=null)
	  {
	    System.err.println("Line " + this.line);
	    System.err.println("ERROR: Argument number mismatch: too many arguments received in call to function "+this.ne.lexeme);
	    err++;
	  }
	}
      }

    void typecheck() {
      if(err>0)
	return;
      err-=ne.err;
      ne.typecheck();
      err+=ne.err;
      this.t = (funcType)ne.t;
      for(Expr e: al) {
	err-=e.err;
	e.typecheck();
	err+=e.err;
      }
      
      Expr a = al.getFirst();
      int iter=0;
      LinkedList<Param> templist = new LinkedList<Param>();
      templist = ((funcType)(this.ne.t)).getplist();
      for (Param p: templist) 
      { 
	if(a==null)
	{
	  break;
	}
	if(p.t.k != a.t.k)
	{
	  System.err.println("Line " + this.line);
	  System.err.println("ERROR: Type mismatch in parameter number "+iter+": expected "+p.t.k+" but received "+a.t.k+" in function "+this.ne.lexeme);
	  err++;
	}
	iter++;
	if(iter==al.size())
	  a=null;
	else
	  a=al.get(iter);
      }
    }
    void cgen(PrintStream ps, StringTable st) {
      int count=0;
      Expr a;
      for(int i=al.size()-1;i>=0;i--)
      {
	al.get(i).cgen(ps,st);
	CGSupport.emitString("\tpush\t%eax",ps);
	count+=4;
      }
      CGSupport.emitString("\tcall\t"+ne.lexeme,ps);
      CGSupport.emitString("\taddl\t$"+count+", %esp",ps);
      // result is in %eax
    }
}
class constantExpr extends Expr {
    enum kind {CHAR_LITERAL, INT_LITERAL, STRING_LITERAL, TRUE, FALSE};
    String s; // string reference
    int i;
    char c;
    kind k;

    constantExpr(kind k, Character c) {
	this.k = k;
	this.c = c.charValue();
	this.i = (int)c;
	t = new Type(Type.kind.CHAR);
    }
    constantExpr(kind k, String s) {
	this.k = k;
	this.s = s;
	t = new Type(Type.kind.STRING);
    }
    constantExpr(kind k, Integer i) {
	this.k = k;
	this.i = i.intValue();
	t = new Type(Type.kind.INT);
    }
    constantExpr(kind k) {
	t = new Type(Type.kind.BOOLEAN);
	if      (k == kind.TRUE)  {this.k = k;i = 1;}
	else if (k == kind.FALSE) {this.k = k;i = 0;}
	else; // print error message or throw exception
    }
    void typecheck() {}
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      if(this.t.k == Type.kind.STRING)
      {
	strTable.addString(this.s);
      }
    }
    void cgen(PrintStream ps, StringTable st) {
      if(this.t.k == Type.kind.CHAR || this.t.k == Type.kind.INT || this.t.k == Type.kind.BOOLEAN)
      {
	CGSupport.emitString("\tmovl\t$"+i+", %eax",ps);
      }
      if(this.t.k == Type.kind.STRING)
      {
	CGSupport.emitString("\tmovl\t$"+st.lookup(this.s)+", %eax",ps);
      }
    }
}

class idExpr extends Expr { // a name of a variable
    String lexeme;
    basicSym symentry;
    idExpr(int line, String lexeme) {
	this.line = line;
	this.lexeme = lexeme;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      // make sure already declared in this scope or above
	if(st.lookup(this.lexeme) == null)
	{
	  System.err.println("Line " + this.line);
	  System.err.println("ERROR: "+this.lexeme+" has not been declared");
	  err++;
	}
	else
	  symentry = st.lookup(this.lexeme);
    }
    void typecheck() {
      this.t = this.symentry.t;
      if(this.t.k == Type.kind.FUNCTION)
      {
	this.t.k = ((funcType)this.t).rt.k;
	this.symentry.func = 1;
      }
    }
    void cgen(PrintStream ps, StringTable st) {  // move value to %eax
    if(this.symentry.func==1)
    {
      System.err.println("Line "+this.line);
      System.err.println("ERROR: expected () at end of function call to "+this.lexeme);
      err++;
      System.exit(1);
    }
       if(this.symentry.currentval!=-1) // global
       {
	  CGSupport.emitString("\tmovl\t"+ this.symentry.currentval+this.symentry.currentOffset +", %eax #move "+this.t.k+" "+this.lexeme+" to %eax",ps);
       }
       else
       {
	  CGSupport.emitString("\tmovl\t"+ this.symentry.currentOffset +", %eax #move "+this.t.k+" "+this.lexeme+" to %eax",ps);
       }
    }
}


class blockStmt extends Stmt { // blockStmt not a function body
    LinkedList<loDecl> dl;
    LinkedList<Stmt> sl;
    int count;                 // count of locals declarations

    blockStmt(LinkedList<loDecl> dl, LinkedList<Stmt> sl) {
	this.dl = dl; 
	this.sl = sl; 
	count = 0;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      st.enterScope();
	for (loDecl d: dl) { 
	    count = d.setCount(count);
	    d.resolve(st,strTable);
	}
	for (Stmt s: sl) { s.resolve(st,strTable);}
      st.exitScope();
    }
    void typecheck() {
	for (loDecl d: dl) { d.typecheck(); err+=d.err;}
	for (Stmt s: sl)     { s.typecheck(); err+=s.err;}
    }
    void cgen(PrintStream ps, StringTable st)
    {
      CGSupport.emitString("\tsubl\t$"+(count)+", %esp",ps);
      for (loDecl d: dl) { d.cgen(ps,st);}
      for (Stmt s: sl)   { s.cgen(ps,st);}
    }
    
}



class block extends Stmt { // block IS a function body
    LinkedList<loDecl> dl;
    LinkedList<Stmt> sl;
    int count;                 // count of locals in a function body

    block(LinkedList<loDecl> dl, LinkedList<Stmt> sl) {
	this.dl = dl; 
	this.sl = sl; 
	count = 4;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
	for (loDecl d: dl) { 
	    count = d.setCount(count);
	    d.resolve(st,strTable);
	}
	for (Stmt s: sl) { s.resolve(st,strTable);}
    }
    void typecheck() {
	for (loDecl d: dl) { d.typecheck(); err+=d.err;}
	for (Stmt s: sl)     { s.typecheck(); err+=s.err;}
    }
    void cgen(PrintStream ps, StringTable st)
    {
      // must subtract bytes for local variables from %esp
      CGSupport.emitString("\tsubl\t$"+(count)+", %esp",ps);
      for (loDecl d: dl) { d.cgen(ps,st);}
      for (Stmt s: sl)   { s.cgen(ps,st);}
    }
    Type.kind getRetType() { 
      //! need to dig deeper to find return statements inside other things (or just declare that return must be in a function)
      //! need to do something about unreachable statements too
      int trigger=0;
      Type.kind tk = Type.kind.FUNCTION;
      returnStmt s2 = new returnStmt(0);
      for (Stmt s: sl)     { 
	if(s.getClass() == s2.getClass())
	{
	  trigger=1;
	  if(((returnStmt)s).e==null)
	  {
	    if(tk == Type.kind.FUNCTION)
	      tk = Type.kind.VOID;
	    else
	      if(tk != Type.kind.VOID)
	      {
		System.err.println("ERROR: Multiple return types declared");
		trigger=2;
		break;
	      }
	  }
	  else
	  {
	    if(tk == Type.kind.FUNCTION)
	    {
	      tk = ((returnStmt)s).e.t.k;
	    }
	    else
	      if(tk != ((returnStmt)s).e.t.k)
	      {
		System.err.println("ERROR: Multiple return types declared");
		trigger=2;
		break;
	      }
	  }
	}
      }
      if(trigger==1) // all is well, return functions all match
	return tk;
      else if(trigger==2) // some error occurred
	return Type.kind.FUNCTION; 
      else // no return function called
	return Type.kind.VOID;
    }
}

class loDecl extends Stmt {
    idExpr ne;
    Type t;
    Expr e;
    int offset;

    // initialized var declaration
    loDecl(int line, idExpr ne, Type t, Expr e) {
	this.ne = ne;
	this.t = t;
	this.e = e;
	this.line = line;
	offset = 0;
    }

    // uninitialized var declaration
    loDecl(int line, idExpr ne, Type t) {
	this.ne = ne;
	this.t = t;
	offset = 0;
    }

    int setCount(int i) { offset = i + 4; return offset;}

    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      // this is where variables are declared inside a block
      if(e!=null) // resolve right side first for declarations
      {
	e.resolve(st,strTable);
	err+=e.err;
      }
      int cont=1;
      if(st.lookup(this.ne.lexeme) != null)
      {
	if(st.lookup(this.ne.lexeme).mydepth == st.scopeLevel()-1)
	{
	    System.err.println("Line " + this.line);
	    System.err.println("ERROR: "+this.ne.lexeme+" has already been declared in this scope");
	    cont=0;
	    err++;
	}
      }
      if(cont==1)
      {
	basicSym atmp;
	atmp = new basicSym(basicSym.kind.LOCAL,this.t,offset);
	atmp.setDepth(st.scopeLevel()-1);
	st.addId(this.ne.lexeme,atmp);
	this.ne.symentry = atmp;
      }
    }
    
    void typecheck() {
      if(err>0) 
	return;
      err-=ne.err;
      ne.typecheck();
      err+=ne.err;
      this.t = ne.t;
      if(e!=null)
      {
	err-=e.err;
	e.typecheck();
	err+=e.err;
	if(this.ne.t.k!=this.e.t.k)
	{
	  System.err.println("Line " + this.line);
	  System.err.println("ERROR: Type mismatch, expected expression of type "+this.ne.t.k+", but received type "+this.e.t.k);
	  err++;
	}
      }
      this.t = new Type(Type.kind.VOID);
    }

     void cgen(PrintStream ps,StringTable st) {
       // generate code for expression e, movl to %eax
       this.ne.symentry.currentOffset = "(%ebp)";
       this.ne.symentry.currentval = (-1*offset);
       // will need to trace using st.scopeDepth
       if(e!=null)
       {
       this.e.cgen(ps,st);
       }
       else
       {
	 CGSupport.emitString("\tmovl\t$0, %eax #"+this.ne.lexeme,ps); 
       }
       // use st.Scopenum and st.Scopedepths to determine actual offset, redeclare
       if(this.ne.symentry.currentval!=-1) // to separate globals
	  CGSupport.emitString("\tmovl\t%eax,"+this.ne.symentry.currentval+this.ne.symentry.currentOffset+" #local declaration of "+this.ne.t.k+" "+this.ne.lexeme,ps);
       else
	 CGSupport.emitString("\tmovl\t%eax,"+this.ne.symentry.currentOffset+" #local declaration of "+this.ne.t.k+" "+this.ne.lexeme,ps);
    }
}

class exprStmt extends Stmt {
    Expr e;

    exprStmt(int line, Expr e) {
	this.line = line;
	this.e = e;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      e.resolve(st,strTable);
      err+=e.err;
    }
    void typecheck() { 
      if(err>0) return; 
      err-=e.err;
      e.typecheck();
      err+=e.err;
    }
    void cgen(PrintStream ps, StringTable st) {e.cgen(ps,st); /*put value of expression in %eax*/}
}

class ifStmt extends Stmt {
    Expr e;
    Stmt s;

    ifStmt(int line, Expr e, Stmt s) {
	this.line = line;
	this.e = e;
	this.s = s;
    }

    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      e.resolve(st,strTable);
      err+=e.err;
      s.resolve(st,strTable);
      err+=s.err;
    }

    void typecheck() {
      if(err>0)
	return;
      err-=e.err;
      e.typecheck();
      err+=e.err;
      if(e.t.k != Type.kind.BOOLEAN)
      {	
	System.err.println("Line " + this.line);
	System.err.println("ERROR: if statements must contain a BOOLEAN operator, but received type "+this.e.t.k);
	err++;
      }
      err-=s.err;
      s.typecheck();
      err+=s.err;
    }
    void cgen(PrintStream ps,StringTable st) {
      e.cgen(ps,st); 
      CGSupport.emitString("\tmovl\t$1, %ecx",ps);
      CGSupport.emitString("\tcmpl\t%eax, %ecx",ps);
      CGSupport.emitString("\tje\tL"+st.count+"if",ps);
      CGSupport.emitString("\tmovl\t$-1, %ecx",ps);
      CGSupport.emitString("\tcmpl\t%eax, %ecx",ps);
      CGSupport.emitString("\tje\tL"+st.count+"if",ps);
      CGSupport.emitString("\tjmp\tL"+st.count+"done",ps);
      CGSupport.emitString("L"+st.count+"if:",ps);
      s.cgen(ps,st);
      CGSupport.emitString("L"+st.count+"done:",ps);
      st.count++;
    }
}
class ifelseStmt extends Stmt {
    Expr e;
    Stmt s1, s2;

    ifelseStmt(int line, Expr e, Stmt s1, Stmt s2) {
	this.line = line;
	this.e = e;
	this.s1 = s1;
	this.s2 = s2;
    }

    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
      e.resolve(st,strTable);
      err+=e.err;
      s1.resolve(st,strTable);
      err+=s1.err;
      s2.resolve(st,strTable);
      err+=s2.err;
    }

    void typecheck() {
      if(err>0)
	return;
      err-=e.err;
      e.typecheck();
      err+=e.err;
      if(e.t.k != Type.kind.BOOLEAN)
      {	
	System.err.println("Line " + this.line);
	System.err.println("ERROR: if statements must contain a BOOLEAN operator, but received type "+this.e.t.k);
	err++;
      }
      err-=s1.err;
      s1.typecheck();
      err+=s1.err;
      err-=s2.err;
      s2.typecheck();
      err+=s2.err;
    }
    void cgen(PrintStream ps,StringTable st) {
      int currcount = st.count;
      st.count++;
      e.cgen(ps,st); 
      CGSupport.emitString("\tmovl\t$1, %ecx",ps);
      CGSupport.emitString("\tcmpl\t%eax, %ecx",ps);
      CGSupport.emitString("\tje\tL"+currcount+"if",ps);
      CGSupport.emitString("\tmovl\t$-1, %ecx",ps);
      CGSupport.emitString("\tcmpl\t%eax, %ecx",ps);
      CGSupport.emitString("\tje\tL"+currcount+"if",ps);
      CGSupport.emitString("\tjmp\tL"+currcount+"else",ps);
      CGSupport.emitString("L"+currcount+"if:",ps);
      s1.cgen(ps,st);
      CGSupport.emitString("\tjmp\tL"+currcount+"done",ps);
      CGSupport.emitString("L"+currcount+"else:",ps);
      s2.cgen(ps,st);
      CGSupport.emitString("L"+currcount+"done:",ps);
    }
}

class printStmt extends Stmt {
    LinkedList<Expr> al;

    printStmt(int line, LinkedList<Expr> al) {
	this.line = this.line;
	this.al = al;
    }

    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
	for(Expr e: al) { 
	    e.resolve(st,strTable);
	    err+=e.err;
	}
    }
    void typecheck() {
      if(err>0) return;
	for(Expr e: al) 
	{
	  err-=e.err; 
	  e.typecheck(); 
	  err+=e.err;
	  // documentation says just "a list of expressions"
	}
    }
    void cgen(PrintStream ps, StringTable st) {
      int count=0;
      for(Expr e: al) 
      {
	e.cgen(ps,st);
	if(e.t.k == Type.kind.STRING)
	{
	  CGSupport.emitString("\tpushl\t%eax",ps);
	  CGSupport.emitString("\tcall\tprintf",ps);
	  CGSupport.emitString("\taddl\t$4, %esp",ps);
	}
	else if(e.t.k == Type.kind.CHAR)
	{
	  CGSupport.emitString("\tpushl\t%eax",ps);
	  CGSupport.emitString("\tmovl\t$.charFormat, %eax\n\tpushl\t%eax",ps);
	  CGSupport.emitString("\tcall\tprintf",ps);
	  CGSupport.emitString("\taddl\t$8, %esp",ps);
	}
	else if(e.t.k == Type.kind.INT || e.t.k == Type.kind.BOOLEAN)
	{
	  CGSupport.emitString("\tpushl\t%eax",ps);
	  CGSupport.emitString("\tmovl\t$.intFormat, %eax\n\tpushl\t%eax",ps);
	  CGSupport.emitString("\tcall\tprintf",ps);
	  CGSupport.emitString("\taddl\t$8, %esp",ps);
	}
      }
    }
}

class returnStmt extends Stmt {
    Expr e;
    Type t;

    returnStmt(int line, Expr e) {
	this.line = line;
	this.e = e;
    }
    returnStmt(int line) {
	this.line = line;
	this.e = null;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
	if (e !=null) {e.resolve(st,strTable); err+=e.err;}
    }
    void typecheck() {
      if(err>0) return;
	if (e !=null) {err-=e.err; e.typecheck();err+=e.err;
	this.t = e.t; 
	}
	else
	  this.t = new Type(Type.kind.VOID);
    }
    void cgen(PrintStream ps, StringTable st) {
      if(e!=null)
	e.cgen(ps,st); // put the return value to %eax
      CGSupport.emitString("\tleave\n\tret",ps);
    }
}

class whileStmt extends Stmt {
    Expr e;
    Stmt s;

    whileStmt(int line, Expr e, Stmt s) {
	this.line = line;
	this.e = e;
	this.s = s;
    }
    void resolve(SymbolTable<String,basicSym> st, StringTable strTable) {
	e.resolve(st,strTable);
	err+=e.err;
	s.resolve(st,strTable);
	err+=s.err;
    }
    void typecheck() {
	if(err>0) return;
	err-=e.err;
	e.typecheck();
	err+=e.err;
	if(e.t.k != Type.kind.BOOLEAN)
	{
	  System.err.println("Line " + this.line);
	  System.err.println("ERROR: while statements must contain a BOOLEAN operator, but received type "+this.e.t.k);
	  err++;
	}
	err-=s.err;
	s.typecheck();
	err+=s.err;
    }
    void cgen(PrintStream ps,StringTable st)
    {
      int currcount = st.count;
      st.count++;
      CGSupport.emitString("L"+currcount+"begin:",ps);
      e.cgen(ps,st);
      CGSupport.emitString("\tmovl\t$1, %ecx",ps);
      CGSupport.emitString("\tcmpl\t%eax, %ecx",ps);
      CGSupport.emitString("\tje\tL"+currcount+"continue",ps);
      CGSupport.emitString("\tmovl\t$-1, %ecx",ps);
      CGSupport.emitString("\tcmpl\t%eax, %ecx",ps);
      CGSupport.emitString("\tje\tL"+currcount+"continue",ps);
      CGSupport.emitString("\tjmp\tL"+currcount+"end",ps);
      CGSupport.emitString("L"+currcount+"continue:",ps);
      s.cgen(ps,st);
      CGSupport.emitString("\tjmp\tL"+currcount+"begin",ps);
      CGSupport.emitString("L"+currcount+"end:",ps);
    }
}
class Param {
    idExpr ne;
    Type t;

	    Param(idExpr ne, Type t) {
		this.ne = ne;
		this.t  = t;
	    }

	    Type getType() { return t;}
}
class Type {
    enum kind {BOOLEAN, CHAR, INT, FUNCTION, STRING, VOID };
    kind k;
    Type(kind k)  {
	this.k = k;
    }

    boolean isEqual(Type other) {
	if (other.k == k) return true;
	else              return false;
    }
    boolean isnotEqual(Type other) {
	if (other.k == k) return false;
	else              return true;
    }

}
class funcType extends Type {
    LinkedList<Param> pl;
    Type rt;

    funcType(Type rt, LinkedList<Param> pl)  {
	super(Type.kind.FUNCTION);
	this.rt = rt;
	this.pl = pl;
    }

    boolean isEqual(Type other) {
      if (other.k == this.rt.k) return true;
      else              return false;
    }

    LinkedList<Param> getplist() { return pl;}
}
