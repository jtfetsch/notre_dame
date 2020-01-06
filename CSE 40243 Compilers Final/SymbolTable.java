import java.util.HashMap;

public class SymbolTable<K,V> {
    private ltab<K,V> tbl;
    private int level;
    
    public SymbolTable() {
        level = 0;
        tbl = new ltab<K,V>();
        // enterScope();
    }
    
    public void enterScope() {
        tbl = new ltab<K,V>(new HashMap<K,V>(), tbl);
        level = level + 1;
    }

    /** Exits the most recently entered scope. */
    public void exitScope() {
	//if(level>1) display();
        if (tbl.empty()) {
          System.out.println(" escopeERROR: trying to exit ");
        }
        tbl = tbl.tail;
        level = level - 1;
    }

    public void addId(K k, V v) {
        if (tbl.empty()) {
          System.out.println(" addidERROR: empty table ");
        }
        HashMap<K,V> h = tbl.ht;
        h.put(k, v);
    }

    public V lookup(K k) {
      ltab<K,V>      t = tbl;
      HashMap<K,V> h = t.ht;
      if (tbl.empty()) {
        System.out.println(" lookupERROR: empty table ");
      }
      while(h != null) {
        V v = h.get(k);
        if (v == null) {
          t = t.tail; h = t.ht;
        }
        else return v;
      }
      return null;
    }

    public V probe(K k) {
        if (tbl.empty()) {
            System.out.println(" probeERROR: empty table ");
        }
        HashMap<K,V> h = tbl.ht;
        return h.get(k);
    }

    public void display() {
        ltab<K,V>      t = tbl;
        HashMap<K,V> h = t.ht;
        int curl = level;
        while(h != null) {
            System.out.println("Scope Level " + curl);
            for(K key: h.keySet()) {
                V value = h.get(key);
                System.out.printf("%s = %s%n", key, value);
            }
            t = t.tail; h = t.ht; curl = curl - 1;
        }
    }

    public String toString() {
      ltab<K,V> t = tbl;
      String  res = "";
      HashMap<K,V>  h = t.ht;
      while (h != null) {
         res += h;
         t = t.tail;
         h = t.ht;
      }
      return res;
    }

    public int scopeLevel() { return level;}

}

class ltab<K,V> {
    HashMap<K,V> ht;
    ltab<K,V>  tail;
    ltab() { ht = null; tail = null;}
    ltab(HashMap<K,V> h, ltab<K,V> t) { ht = h; tail = t;}
    boolean empty() { return tail==null;}
}
