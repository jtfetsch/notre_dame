JAVA=java
JAVAC=javac
JFLEX=/opt/jflex/bin/jflex
CUPCLASSPATH=/opt/
CLASSPATH=${CUPCLASSPATH}:.

SUPP_SRC := \
        CFLexer.java \
	parser.java \
	CFMain.java \
	CFUtils.java \
	StringTable.java \
	SymbolTable.java \
	CGSupport.java

TREE_SRC := cflat-tree.java

CUP=$(JAVA) -classpath ${CLASSPATH} java_cup.Main <

SRC := ${SUPP_SRC} ${TREE_SRC}

CLS := ${patsubst %.java,%.class,${SRC}}

test: ${CLS}
	${JAVA} -classpath ${CLASSPATH} CFMain test23.cflat
//	${JAVA} -classpath ${CLASSPATH} CFMain test21.cflat
//	${JAVA} -classpath ${CLASSPATH} CFMain test03.cflat
//	${JAVA} -classpath ${CLASSPATH} CFMain test02.cflat
//	${JAVA} -classpath ${CLASSPATH} CFMain test04.cflat
//	${JAVA} -classpath ${CLASSPATH} CFMain test05.cflat
//	${JAVA} -classpath ${CLASSPATH} CFMain test06.cflat
//	${JAVA} -classpath ${CLASSPATH} CFMain test07.cflat
//	${JAVA} -classpath ${CLASSPATH} CFMain test08.cflat
//	${JAVA} -classpath ${CLASSPATH} CFMain test11.cflat
//	${JAVA} -classpath ${CLASSPATH} CFMain test12.cflat
//	${JAVA} -classpath ${CLASSPATH} CFMain test22.cflat


CFLexer.java: cflat.flex
	${JFLEX} cflat.flex

${CLS}: ${SRC} 
	${JAVAC} -classpath ${CLASSPATH} ${SRC}
	touch cflat-tree.class

parser.java sym.java: cflat.cup
	$(CUP) cflat.cup

clean:
	rm -rf *.class parser.java CFLexer.java 
