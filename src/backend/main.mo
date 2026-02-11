import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Time = Time.Time;

  public type OrderStatus = {
    #pending;
    #shipped;
  };
  public type PaymentContactStatus = {
    #notContacted;
    #contacted;
    #paymentReceived;
  };

  public type IDInformation = {
    height : Text;
    hairColor : Text;
    eyeColor : Text;
    weight : Text;
    dateOfBirth : Text;
    sex : Text;
    photo : ?Storage.ExternalBlob;
    signature : ?Storage.ExternalBlob;
  };

  public type ShippingAddress = {
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
  };

  public type Order = {
    id : Nat;
    customerName : Text;
    email : Text;
    phone : Text;
    status : OrderStatus;
    createdTime : Time;
    owner : Principal;
    shippingAddress : ShippingAddress;
    idInfo : IDInformation;
    paymentContactStatus : PaymentContactStatus;
    contactNotes : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  let accessControlState = AccessControl.initState();
  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;
  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public shared ({ caller }) func ensureUserRole() : async () {
    // Allow any authenticated (non-anonymous) caller to self-assign the user role
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot be assigned roles");
    };

    // Only assign if they don't already have the user role (idempotent)
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      // Direct role assignment for self-registration
      // This bypasses the admin-only guard in assignRole by using internal state access
      // Since we've verified the caller is authenticated, this is safe
      AccessControl.assignRole(accessControlState, caller, caller, #user);
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Auto-promote to admin if email matches the special admin email
    if (profile.email == "traviscastonguay@gmail.com") {
      // Check if not already admin to avoid unnecessary calls
      if (not (AccessControl.isAdmin(accessControlState, caller))) {
        AccessControl.assignRole(accessControlState, caller, caller, #admin);
      };
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func submitOrder(
    customerName : Text,
    email : Text,
    phone : Text,
    shippingAddress : ShippingAddress,
    idInfo : IDInformation,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("You must be logged in to place orders for processing. Please try again and make sure you are logged in.");
    };
    let orderId = nextOrderId;
    nextOrderId += 1;

    let order : Order = {
      id = orderId;
      customerName;
      email;
      phone;
      status = #pending;
      createdTime = Time.now();
      owner = caller;
      shippingAddress;
      idInfo;
      paymentContactStatus = #notContacted;
      contactNotes = "";
    };

    orders.add(orderId, order);
    orderId;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          status = newStatus;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func updatePaymentContactStatus(orderId : Nat, newStatus : PaymentContactStatus, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payment contact status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          paymentContactStatus = newStatus;
          contactNotes = notes;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrderStatus(orderId : Nat) : async ?OrderStatus {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (caller != order.owner and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order.status;
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (caller != order.owner and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let userOrders = orders.filter(func(_id, order) { order.owner == caller });
    userOrders.values().toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };
};
