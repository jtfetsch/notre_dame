public class CFUtils {

    // input /a/b/c.cflat, returns /a/b/c
    public static String remExt(String fn) {
        if (fn == null) { return null; }

        int epos = fn.lastIndexOf(".");
        int dpos = fn.lastIndexOf("/");

        if (dpos > epos) return null;
        else             return fn.substring(0, epos);
    }
}
