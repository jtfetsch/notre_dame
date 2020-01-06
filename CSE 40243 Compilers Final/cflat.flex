import java_cup.runtime.*;

/* options */

%%
%class CFLexer
%cup
%debug
//%cupdebug

%{
    // Max size of string constants 64
    static int MAX_STR_LEN = 65;

    // assembling strings
    StringBuffer strbuf = new StringBuffer();

    // check string overflow
    Symbol check_str_length() {
        if (strbuf.length() > MAX_STR_LEN) {
            yybegin(STRING_RECOVER);
            return new Symbol(sym.ERROR, "String too long");
        }
        return null; 
    }
    int curr_lineno() { return yyline; }
    int strlen = 0;
%}

%init{
    yyline = 1;
%init}

 

%eofval{
    int lexical_state = yystate();
    switch(lexical_state) {
    case YYINITIAL: 
	{
		break;
	}
    case STRINGLITERAL:
	{
		return new Symbol(sym.EOF,"EOF reached inside string literal");
	}
    case STRING_RECOVER:
	{
		return new Symbol(sym.EOF,"EOF reached inside string literal");
	}
    case CHARLITERAL:
	{
		return new Symbol(sym.EOF,"EOF reached inside character literal");
	}
    case CHAR_RECOVER:
	{
		return new Symbol(sym.EOF,"EOF reached inside character literal");
	}
    case CPPCOMMENTLITERAL:
	{
		return new Symbol(sym.EOF,"EOF reached inside CPP style comment");
	}
    case COMMENTLITERAL:
	{
		return new Symbol(sym.EOF,"EOF reached inside comment, unended C style comment");
	}
    // add other cases if EOF is seen in strings or comments
    }
    return new Symbol(sym.EOF);
%eofval}

LineTerminator  = \r|\n|\r\n
InputCharacter  = [^\r\n]
Identifier      = [A-Za-z_][A-Za-z_0-9]*
binary_int      = 0b[01][01_]*
octal_int       = 0o[0-7][0-7_]*
decimal_int     = [0-9][0-9_]*
hex_int         = 0x[0-9a-fA-F][0-9a-fA-F_]*
IntLiteral      = ({binary_int}|{octal_int}|{hex_int}|{decimal_int})[i]?
CPPStyleComment = "//"
WhiteSpace      = {LineTerminator} | [ \t\f]
%state STRINGLITERAL, CHARLITERAL, COMMENTLITERAL,CPPCOMMENTLITERAL, STRING_RECOVER, CHAR_RECOVER

%%

<YYINITIAL> {

    /* keywords */
    ";"			{return new Symbol(sym.SEMI);}
    "boolean"           {return new Symbol(sym.BOOLEAN);}
    "char"              {return new Symbol(sym.CHAR);}
    "string"            {return new Symbol(sym.STRING);}
    "int"		{return new Symbol(sym.INT);}
    "else"		{return new Symbol(sym.ELSE);}
    "if"		{return new Symbol(sym.IF);}
    "print"		{return new Symbol(sym.PRINT);}
    "return"		{return new Symbol(sym.RETURN);}
    "void"		{return new Symbol(sym.VOID);}
    "while"		{return new Symbol(sym.WHILE);}
    

    /* separators */

    "("              {return new Symbol(sym.LPAREN);}
    ")"              {return new Symbol(sym.RPAREN);}
    "{"              {return new Symbol(sym.LBRACE);}
    "}"              {return new Symbol(sym.RBRACE);}


    {CPPStyleComment}	{yybegin(CPPCOMMENTLITERAL);} // increment line # because ends on terminal

    "/*"		{yybegin(COMMENTLITERAL);} // enter comment state
    
    /* Error comment */
    "*/"		{return new Symbol(sym.ERROR,"Unmatched comment terminator on line "+curr_lineno());}

    /* operators */
    ","              	{return new Symbol(sym.COMMA);}
    "+"              	{return new Symbol(sym.ADD);}
    "-"              	{return new Symbol(sym.SUB);}
    "*"              	{return new Symbol(sym.STAR);}
    "/"              	{return new Symbol(sym.DIV);}
    "<="		{return new Symbol(sym.LE);}
    ">="		{return new Symbol(sym.GE);}
    ">"			{return new Symbol(sym.GT);}
    "<"			{return new Symbol(sym.LT);}
    "=="		{return new Symbol(sym.EQ);}
    "!="		{return new Symbol(sym.NE);}
    "&&"		{return new Symbol(sym.AND); }
    "||"		{return new Symbol(sym.OR);}
    "="			{return new Symbol(sym.ASSIGN); }
    "!"              	{return new Symbol(sym.NOT); }

    /* boolean literal */
    "false"          {return new Symbol(sym.FALSE);}
    "true"           {return new Symbol(sym.TRUE);}

    /* Identifier */
    {Identifier}     {return new Symbol(sym.IDENTIFIER, new String(yytext()));}

    /* Integer literal */
    {IntLiteral}	{return new Symbol(sym.INT_LITERAL,new String(yytext()));}
    /* String literal */
    \"               { strlen=0; strbuf.delete(0,strbuf.length()); yybegin(STRINGLITERAL);}
    /* Character literal */
    \'               { strlen=0; strbuf.delete(0,strbuf.length()); yybegin(CHARLITERAL);}

    {LineTerminator}	{yyline++;}

    {WhiteSpace}     { /* ignore */ }
    

    .			{return new Symbol(sym.ERROR,"Illegal character: <"+yytext()+"> on line "+curr_lineno());}
}

<STRINGLITERAL> {
    \"        {yybegin(YYINITIAL); return new Symbol(sym.STRING_LITERAL, new String(strbuf.toString())); }

    // if line terminator found, return, but pass error specifying where error was
    {LineTerminator}	{  yybegin(YYINITIAL); yyline++; return new Symbol(sym.ERROR,"String contains an unescaped newline on line "+(curr_lineno()-1));}

    . 		{ /* append everything that isn't EOF or a line terminator */ 
		  strbuf.append(new String(yytext()));
		  if(strbuf.length()>MAX_STR_LEN)
		      {yybegin(STRING_RECOVER); return new Symbol(sym.ERROR, "String length greater than MAX_STR_LEN detected on line "+curr_lineno());} // character is too long, resume after end of string

		}
}

<CHARLITERAL> {
    \'       {yybegin(YYINITIAL); return new Symbol(sym.CHAR_LITERAL, new String(strbuf.toString())); }
    
    // if line terminator found, return, but pass error specifying where error was
    {LineTerminator}	{yybegin(YYINITIAL); yyline++; return new Symbol(sym.ERROR,"Character contains an unescaped newline on line "+(curr_lineno()-1));}
    \\.		{/* append first char that isn't EOF or a line terminator */ 
		  strbuf.append(new String(yytext())); // allow entry of '/n' or similar
		 if(strbuf.length()>2)
		      {yybegin(CHAR_RECOVER); return new Symbol(sym.ERROR,"Character max size 1 exceeeded on line "+curr_lineno());}
		   }

    . 		{ /* append first char that isn't EOF or a line terminator */ 
		  strbuf.append(new String(yytext()));
		 if(strbuf.length()>1)
		      {yybegin(CHAR_RECOVER); return new Symbol(sym.ERROR,"Character max size 1 exceeeded on line "+curr_lineno());}
		  
		}
}

<COMMENTLITERAL> {
    "*/"       {yybegin(YYINITIAL); } // return

    {LineTerminator}	{yyline++;} // still maintain line number...
    
    . 		{ /* ignore, it's a comment */ }
}

<CPPCOMMENTLITERAL> { // return

    {LineTerminator}	{yyline++; yybegin(YYINITIAL); } // still maintain line number...
    
    . 		{ /* ignore, it's a comment */ }
}


<STRING_RECOVER> {
    \"      { yybegin(YYINITIAL); }
    {LineTerminator}	{yyline++; yybegin(YYINITIAL); return new Symbol(sym.ERROR, "Exceedingly long string contains an unescaped newline on line "+(curr_lineno()-1));}
    .	    { /* ignore because this is after end of possible string */ }
}

<CHAR_RECOVER> {
    \'      { yybegin(YYINITIAL); }
    {LineTerminator}	{yyline++; yybegin(YYINITIAL); return new Symbol(sym.ERROR, "Exceedingly long string contains an unescaped newline on line "+(curr_lineno()-1));}
    .	    { /* ignore because this is after end of possible string */ }
}
