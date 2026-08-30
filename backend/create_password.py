from app.services.auth import crear_password_hash

password = input("Contraseña: ")

print("\nHash:")
print(crear_password_hash(password))