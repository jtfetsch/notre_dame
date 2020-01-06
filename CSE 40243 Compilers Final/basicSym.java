class basicSym {
    // symbol type
    public enum kind {LOCAL, GLOBAL, PARAM, NAME, FUNCTION}; 
    public kind k;
    public Type t;
    public int offset;  // may be needed for code generation
    public int mydepth; // maintain scope declaration depth
    public String currentOffset = "0";
    public int currentval = -1;
    public int func = 0;

    // for globals
    public basicSym(kind k, Type t) {
        this.k = k;
        this.t = t;
    }

    // for parameters and local variables
    public basicSym(kind k, Type t, int offset) {
        this.k = k;
        this.t = t;
        this.offset = offset;
    }

    void setDepth(int i){
    this.mydepth=i;
    }
}
