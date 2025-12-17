# Dokumentace - E-shop s nábytkem

## 1. Úvod

Tento projekt představuje jednoduchou webovou aplikaci e-shopu s nábytkem.
Aplikace umožňuje uživateli vybrat produkty, vytvořit objednávku a sledovat její stav v reálném čase.

## 2. REST API - dokumentace rozhraní

### 2.1 Vytvoření objednávky

**Endpoint:**
`POST /order`

**Popis:**
Vytvoří novou objednávku a odešle ji externí službě dopravce.

**Request body:**

```json
{
  "address": "Ulice 1, Město",
  "furniture": [
    {
      "name": "Židle",
      "dimensions": {
        "width": 45,
        "length": 45,
        "height": 90
      },
      "weight": 6,
      "count": 2
    }
  ]
}
```

**Popis polí:**

* `address` - doručovací adresa
* `furniture` - seznam objednaného nábytku
* `name` - název produktu
* `dimensions` - rozměry v cm
* `weight` - hmotnost jednoho kusu
* `count` - počet kusů

**Response:**

```json
{
  "order_id": "uuid",
  "courierStatus": 201
}
```

**Chybové odpovědi:**

* `400 Bad Request` - neplatná data
* `500 Internal Server Error` - chyba při komunikaci s dopravcem

## 3. WebSocket - dokumentace rozhraní

Aplikace používá **Socket.IO** pro přenos informací o stavu objednávky v reálném čase.

### 3.1 Událost `orderUpdate`

**Směr komunikace:**
server -> klient

**Popis:**
Událost je odeslána serverem při změně stavu objednávky.

**Data:**

```json
{
  "order_id": "uuid",
  "status": "IN_TRANSIT"
}
```

**Popis polí:**

* `order_id` - identifikátor objednávky
* `status` - aktuální stav objednávky

**Chování klienta:**
Klient zobrazuje aktualizaci pouze v případě, že `order_id` odpovídá právě vytvořené objednávce.

## 4. Webhook - dokumentace rozhraní

Webhook slouží k příjmu aktualizací stavu objednávky od externí služby.

### 4.1 Aktualizace objednávky

**Endpoint:**
`POST /order/update`

**Popis:**
Dopravce tímto endpointem informuje e-shop o změně stavu objednávky.

**Headers:**

* `X-Signature` - HMAC SHA-256 podpis zprávy

**Request body:**

```json
{
  "event_id": "uuid",
  "order_id": "uuid",
  "status": "DELIVERED"
}
```

**Popis polí:**

* `event_id` - unikátní identifikátor události
* `order_id` - identifikátor objednávky
* `status` - nový stav objednávky

### 4.2 Zabezpečení webhooku

* zpráva je podepsána pomocí **HMAC SHA-256**
* podpis je ověřen pomocí sdíleného tajemství
* aplikace kontroluje duplicitu událostí pomocí `event_id`

**Response:**

* `200 OK` - webhook úspěšně zpracován
* `401 Unauthorized` - neplatný podpis

## 5. Tok komunikace v aplikaci

1. Uživatel přidá produkty do košíku
2. Klient odešle objednávku pomocí REST API
3. Server objednávku předá dopravci
4. Dopravce odešle aktualizaci pomocí webhooku
5. Server zpracuje webhook a odešle aktualizaci přes WebSocket
6. Klient zobrazí aktuální stav objednávky v reálném čase
