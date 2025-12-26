import unittest

from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine

from main import app
from database import get_session
from models import User


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
)


def get_session_override():
    with Session(engine) as session:
        yield session


class TestUsersRoutes(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        SQLModel.metadata.create_all(engine)
        app.dependency_overrides[get_session] = get_session_override
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()

    # POST /users
    def test_create_user(self):
        payload = {
            "name": "Miguel",
            "email": "miguel@test.com",
            "password": "123456",
            "role": "aluno",
        }

        response = self.client.post("/users/", json=payload)

        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], payload["name"])
        self.assertEqual(data["email"], payload["email"])
        self.assertEqual(data["role"], payload["role"])

    # GET /users
    def test_read_users(self):
        response = self.client.get("/users/")

        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)

    # GET /users/{id}
    def test_read_user_by_id(self):
        payload = {
            "name": "User ID Test",
            "email": "id@test.com",
            "password": "123456",
            "role": "professor",
        }

        create_response = self.client.post("/users/", json=payload)
        self.assertEqual(create_response.status_code, 200)

        user_id = create_response.json()["id"]

        response = self.client.get(f"/users/{user_id}")

        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["id"], user_id)
        self.assertEqual(data["email"], payload["email"])
        self.assertEqual(data["role"], payload["role"])


if __name__ == "__main__":
    unittest.main()
