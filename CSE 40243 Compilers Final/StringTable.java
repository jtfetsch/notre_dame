import java.util.HashMap;

public class StringTable {
    public HashMap<String,String> tbl;
    public int nref;
    public int count;


    public int Scopenum=0; // used with maintaining how deep to go 
			    // (each ne will have a symtable entry with mydepth)
    public int[] Scopedepths = new int[1000];
    
    public StringTable() {
        tbl = new HashMap<String,String>();
	count=0;
    }
    
    public void addId(String s, String sref) { tbl.put(s, sref); }

    public String addString(String s) { 
        if (lookup(s) == null) {
            String tmp = ".STR" + nref; 
            ++nref;
            tbl.put(s,tmp);
        }
        return lookup(s);
    }

    public String[] getAll() {
        String[] as = new String[tbl.size()];
        int i = 0;
        for(String key: tbl.keySet()) { as[i] = key; ++i;}
        return as;
    }

    public int getNREF() {return nref;}

    public String lookup(String s) { String sref = tbl.get(s); return sref; }

    public String getLoc(String s) { 
	for(String key: tbl.keySet()) 
	{
            String value = tbl.get(key);
            if(value.equals(s)) return key;
        }
    return null;
    }

    public void display() {
        for(String key: tbl.keySet()) {
            String value = tbl.get(key);
            System.out.println(key+" = "+value);
        }
    }
}
