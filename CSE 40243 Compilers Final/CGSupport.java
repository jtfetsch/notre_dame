import java.io.*;
class CGSupport {
    
    private static int NR = 6;
    private static int[] inuse = {1, 0, 0, 0, 0, 0};
    private static String[] rn = {"%eax", "%ebx", "%ecx", "%edx", "%esi", "%edi"};
    // Prologue and Epilogue
    static void emitPrologue(PrintStream ps) {
	emitString("\t.file \".test23.cflat\"",ps);
        emitString("\t.section\t.rodata",ps);
    }
    static void emitStringPrologue(PrintStream ps) {
	emitString(".intFormat:\t.string\t\"%d\"",ps);
	emitString(".charFormat:\t.string\t\"%c\"",ps);
	emitString(".boolFormat:\t.string\t\"%d\"",ps);
        emitString(".section\t.data",ps);
	//emitString("true:\t.long\t1",ps);
	//emitString("false:\t.long\t0",ps);
    }
    static void emitEpilogue(PrintStream ps) {
	emitString(".section\t.text",ps);
        emitString(".globl\t_start",ps);
        emitString("_start:",ps);
	emitString("\tcall main", ps);
	/*emitString("\tpushl\t%eax",ps);
	emitString("\tmovl\t$.intFormat, %eax\n\tpushl\t%eax",ps);
	emitString("\tcall\tprintf",ps);
	emitString("\taddl\t$8, %esp",ps);*/
        emitString("\tpushl $0", ps);
        emitString("\tcall exit", ps);
    }
    // Helper functions        
    static void emitString(String str, PrintStream ps) {
        ps.println(str);
    }
    static void emitMOVL(String src, String dst, PrintStream ps) {
        ps.println("\tmovl " + src + "," + dst);
    }
    static void emitADDL(String src, String dst, PrintStream ps) {
        ps.println("\taddl " + src + "," + dst);
    }
    static void emitIMULL(String src, String dst, PrintStream ps) {
        ps.println("\timull " + src + "," + dst);
    }
    static void emitPRINT(int j, PrintStream ps) {
        ps.println("\tpushl "+ getRegName(j));
        ps.println("\tpushl $fmt");
        ps.println("\tcall printf");
    }
    // Register allocation, free and index to name mapping
    static int getRi() {
        for (int i=1; i<NR; ++i) {
            if (inuse[i] == 0) { inuse[i] = 1; return i;}
        }
        return -1;
    }
    static void freeRi(int i) { inuse[i] = 0;}
    static String getRegName(int i) { return rn[i];}
}
