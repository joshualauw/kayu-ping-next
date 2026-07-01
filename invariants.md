# Invariants

This file tells specific business rules that later can be implemented in service layer or UI layer

## Purchase

- FE:[v]|BE:[v] Total Volume and Total price must match from the ones in purchase items

## Sales

- FE:[v]|BE:[ ] Total Volume and Total price must match from the ones in sales items
- FE:[v]|BE:[v] wood must be physically exist in location to sell
- FE:[v]|BE:[v] wood must be enough stock to sell

## Processing

- FE:[V]|BE:[ ] wood output volume cannot exceed input volume (for example total input 12 m3 to 14m3 is not allowed)
- FE:[V]|BE:[ ] wood species for output must be same as input (for example Log A to Log B is not allowed)
- FE:[V]|BE:[ ] wood must be physically exist in location to process
- FE:[V]|BE:[ ] wood must be enough stock to process
