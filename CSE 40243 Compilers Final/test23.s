	.file ".test23.cflat"
	.section	.rodata
.STR6:	.string	") = "
	.text
.STR2:	.string	"OR test: "
	.text
.STR0:	.string	"thisstring"
	.text
.STR5:	.string	"Fibonacci("
	.text
.STR3:	.string	"AND test: "
	.text
.STR1:	.string	"\n"
	.text
.STR4:	.string	"here's a string deep in the something\n"
	.text
.intFormat:	.string	"%d"
.charFormat:	.string	"%c"
.boolFormat:	.string	"%d"
.section	.data
a:	.long	5
b:	.long	.STR0
c:	.long	1
.section	.text
.globl	_start
_start:
	call main
	pushl $0
	call exit
main:
	pushl	%ebp
	movl	%esp, %ebp
	subl	$24, %esp
	movl	$1, %eax
	pushl	%eax
	movl	$0, %eax
	popl	%ecx
	cmpl	%eax, %ecx
	andl	%ecx, %eax
	movl	%eax,-8(%ebp) #local declaration of BOOLEAN sdjf
	movl	$97, %eax
	movl	%eax,-12(%ebp) #local declaration of CHAR c
	movl	$6, %eax
	pushl	%eax
	movl	$3, %eax
	popl	%ecx
	imull	%ecx, %eax
	movl	%eax,-16(%ebp) #local declaration of INT d
	movl	-16(%ebp), %eax #move INT d to %eax
	pushl	%eax
	movl	$3, %eax
	popl	%ecx
	addl	%ecx, %eax
	movl	%eax,-20(%ebp) #local declaration of INT e
	movl	$0, %eax
	movl	%eax,-24(%ebp) #local declaration of BOOLEAN f
L0begin:
	movl	-24(%ebp), %eax #move BOOLEAN f to %eax
	notl	%eax
	addl	$2, %eax
	movl	$1, %ecx
	cmpl	%eax, %ecx
	je	L0continue
	movl	$-1, %ecx
	cmpl	%eax, %ecx
	je	L0continue
	jmp	L0end
L0continue:
	subl	$4, %esp
	movl	$0, %eax
	movl	%eax,-4(%ebp) #local declaration of INT b
	movl	a, %eax #move INT a to %eax
	pushl	%eax
	movl	$.intFormat, %eax
	pushl	%eax
	call	printf
	addl	$8, %esp
	movl	$.STR1, %eax
	pushl	%eax
	call	printf
	addl	$4, %esp
	movl	a, %eax #move INT a to %eax
	pushl	%eax
	movl	$1, %eax
	popl	%ecx
	addl	%ecx, %eax
	movl	%eax, a #move %eax to INT a
	movl	$.STR2, %eax
	pushl	%eax
	call	printf
	addl	$4, %esp
	movl	$1, %eax
	pushl	%eax
	movl	$1, %eax
	popl	%ecx
	orl	%ecx, %eax
	pushl	%eax
	movl	$.intFormat, %eax
	pushl	%eax
	call	printf
	addl	$8, %esp
	movl	$0, %eax
	pushl	%eax
	movl	$0, %eax
	popl	%ecx
	orl	%ecx, %eax
	pushl	%eax
	movl	$.intFormat, %eax
	pushl	%eax
	call	printf
	addl	$8, %esp
	movl	$1, %eax
	pushl	%eax
	movl	$0, %eax
	popl	%ecx
	orl	%ecx, %eax
	pushl	%eax
	movl	$.intFormat, %eax
	pushl	%eax
	call	printf
	addl	$8, %esp
	movl	$0, %eax
	pushl	%eax
	movl	$1, %eax
	popl	%ecx
	orl	%ecx, %eax
	pushl	%eax
	movl	$.intFormat, %eax
	pushl	%eax
	call	printf
	addl	$8, %esp
	movl	$.STR1, %eax
	pushl	%eax
	call	printf
	addl	$4, %esp
	movl	$.STR3, %eax
	pushl	%eax
	call	printf
	addl	$4, %esp
	movl	$1, %eax
	pushl	%eax
	movl	$1, %eax
	popl	%ecx
	cmpl	%eax, %ecx
	andl	%ecx, %eax
	pushl	%eax
	movl	$.intFormat, %eax
	pushl	%eax
	call	printf
	addl	$8, %esp
	movl	$0, %eax
	pushl	%eax
	movl	$0, %eax
	popl	%ecx
	cmpl	%eax, %ecx
	andl	%ecx, %eax
	pushl	%eax
	movl	$.intFormat, %eax
	pushl	%eax
	call	printf
	addl	$8, %esp
	movl	$1, %eax
	pushl	%eax
	movl	$0, %eax
	popl	%ecx
	cmpl	%eax, %ecx
	andl	%ecx, %eax
	pushl	%eax
	movl	$.intFormat, %eax
	pushl	%eax
	call	printf
	addl	$8, %esp
	movl	$0, %eax
	pushl	%eax
	movl	$1, %eax
	popl	%ecx
	cmpl	%eax, %ecx
	andl	%ecx, %eax
	pushl	%eax
	movl	$.intFormat, %eax
	pushl	%eax
	call	printf
	addl	$8, %esp
	movl	$.STR1, %eax
	pushl	%eax
	call	printf
	addl	$4, %esp
L1begin:
	movl	-4(%ebp), %eax #move INT b to %eax
	pushl	%eax
	movl	$4, %eax
	popl	%ecx
	cmpl	%eax, %ecx
	jl	L2true
	xorl	%eax, %eax
	jmp	L2done
L2true:	movl	$1, %eax
L2done:
	movl	$1, %ecx
	cmpl	%eax, %ecx
	je	L1continue
	movl	$-1, %ecx
	cmpl	%eax, %ecx
	je	L1continue
	jmp	L1end
L1continue:
	subl	$8, %esp
