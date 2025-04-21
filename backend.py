@app.route('/submit_quote', methods=['POST'])
@csrf.exempt  # Ou implemente CSRF adequadamente
@limit_content_length(1024 * 10)
def submit_quote():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "Nenhum dado recebido"}), 400

        required_fields = ['name', 'email', 'phone', 'details']
        if not all(field in data for field in required_fields):
            return jsonify({"status": "error", "message": "Campos obrigatórios faltando"}), 400

        if not validate_email(data['email']):
            return jsonify({"status": "error", "message": "Email inválido"}), 400

        if not validate_phone(data['phone']):
            return jsonify({"status": "error", "message": "Telefone inválido"}), 400

        if len(data['details']) > 500:
            return jsonify({"status": "error", "message": "Detalhes muito longos (máx 500 caracteres)"}), 400

        email_body = f"""
        <h2>Nova solicitação de orçamento</h2>
        <p><strong>Nome:</strong> {data['name'][:100]}</p>
        <p><strong>Email:</strong> {data['email'][:100]}</p>
        <p><strong>Telefone:</strong> {data['phone'][:20]}</p>
        <p><strong>Detalhes:</strong> {data['details'][:500]}</p>
        """
        
        send_email("Novo Orçamento - Sirleia Bordados", email_body, "contato@sirleiabordados.com.br")
        
        logger.info(f"Orçamento recebido de: {data['email']}")
        return jsonify({
            "status": "success",
            "message": "Sua solicitação foi recebida com sucesso! Entraremos em contato em breve."
        }), 200
        
    except smtplib.SMTPException as e:
        logger.error(f"Erro ao enviar email: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Erro ao enviar sua mensagem. Por favor, tente novamente mais tarde."
        }), 500
    except Exception as e:
        logger.error(f"Erro inesperado: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Ocorreu um erro inesperado. Por favor, tente novamente."
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)  # Debug=False em produção
    import phonenumbers

def validate_phone(phone):
    try:
        parsed = phonenumbers.parse(phone, "BR")
        return phonenumbers.is_valid_number(parsed)
    except phonenumbers.NumberParseException:
        return False