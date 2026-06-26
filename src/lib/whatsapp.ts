type PedidoParaMensagem = {
  nomeCliente: string;
  telefoneCliente: string;
  endereco: string;
  total: string | number;
  itens: { nomeProduto: string; quantidade: number }[];
};

export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const numero = telefone.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export function mensagemDespacho(pedido: PedidoParaMensagem): string {
  const itensTexto = pedido.itens
    .map((i) => `• ${i.quantidade}x ${i.nomeProduto}`)
    .join("\n");

  return (
    `Olá ${pedido.nomeCliente}! 🛵\n\n` +
    `Seu pedido saiu para entrega!\n\n` +
    `*Itens:*\n${itensTexto}\n\n` +
    `*Total:* R$ ${Number(pedido.total).toFixed(2)}\n` +
    `*Endereço:* ${pedido.endereco}\n\n` +
    `Em breve chegará até você! Obrigado pela preferência.`
  );
}
