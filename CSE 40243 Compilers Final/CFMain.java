import java.io.*;
import java_cup.runtime.Symbol;

public class CFMain {

  public static void main(String argv[]) {

    Symbol rootsym = null;
    Program root   = null; // root of the AST
    int do_debug_parse = 0;
    for (int i = 0; i < argv.length; i++) {
      try {
        System.out.println("Parsing ["+argv[i]+"] ");
        CFLexer s = new CFLexer(new FileReader(argv[i]));
        parser p = new parser(s);
        if (do_debug_parse == 1) { p.debug_parse();}
           
        else { 
            PrintStream output = System.out;
            rootsym = p.parse();
            root    = (Program) rootsym.value;
            // semantic analysis contains two phases, symbol resolution and typechecking.
	    System.out.println("Resolving...");
            root.resolve();
	    System.out.println("Typechecking...");
            root.typecheck();
	    if(root.err==0)
	    {
	      System.out.println("no errors.");
	      String outfile = CFUtils.remExt(argv[i]) + ".s";
	      output = new PrintStream(new FileOutputStream(outfile));
	      System.out.println("Generating Code...");
	      root.cgen(output);
	      System.out.println("Generated code to " + outfile);
	    }
	    else
	      System.out.println(root.err+" ERRORS FOUND.");
        }
      }
      catch (Exception e) {
        e.printStackTrace(System.out);
        System.exit(1);
      }
    }
  }
}
